import { Router, urlencoded, Request, Response } from 'express';
import http from 'http'
import cookieParser from 'cookie-parser'
import env from 'dotenv'
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt from 'jsonwebtoken'
import { readFileSync, createWriteStream } from 'fs'
import User, { PictureSource, UserData } from '../../../schemas/user'
import { rateLimit } from '../../middlewares/ratelimit';

const router = Router()
const gClient = new OAuth2Client()
env.config()

const privateKey = readFileSync(__dirname + '/../../../keys/jwtRS512.key', { encoding: 'utf8' })

router.use(cookieParser())

async function verifyG(token: string) {
    const ticket = await gClient.verifyIdToken({
        idToken: token,
        audience: process.env.G_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload
}

async function findOrCreateUser(googleUser: TokenPayload): Promise<UserData>{
    const userId = googleUser.sub
    const found = await User.findOne({ google_id: userId }).lean()
    if(found) {
        if(found.picture.source === PictureSource.Google && found.picture.url != googleUser.picture){
            const new_picture = ({
                url: googleUser.picture || null,
                source: PictureSource.Google
            })
            await User.updateOne({ _id: found._id }, { $set: { picture: new_picture }})
            found.picture = new_picture
        }
        return found
    }
    return await User.create({
        google_id: userId,
        name: googleUser.name,
        picture: {
            url: googleUser.picture,
            source: googleUser.picture ? PictureSource.Google : null
        }
    })
}

router.post('/login', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 0,
            limit: 0
        },
        anonymous: {
            time: 1000,
            limit: 10
        }
    }
}), urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try{
        if(req.signedIn) return res.status(400).json({ error: 1, message: 'You are already logged in' })
        const { credential, g_csrf_token } = req.body
        if(!credential || !g_csrf_token || !req.cookies['g_csrf_token']) return res.status(400).json({ error: 0, message: 'Google credential and csrf token are required.'})
        if(g_csrf_token !== req.cookies['g_csrf_token']) return res.status(403).json({ error: 2, message: 'CSRF tokens are not valid.'})
        const googleUser = await verifyG(credential)
        if(!googleUser) return res.status(403).json({ error: 3, message: 'Token is not validated.'})
        const user: UserData = await findOrCreateUser(googleUser);
        const token: string = jwt.sign({
            userId: user._id
        }, privateKey, { algorithm: 'RS512', expiresIn: '72h' })
        res.cookie('access_token', token, { httpOnly: true, secure: true, maxAge: 72 * 3600 * 1000, sameSite: 'strict' })
        return res.status(200).redirect('/')
    }catch(err){
        return res.status(500).json({ error: 4, message: String(err) }) 
    }
})

router.post('/logout', (req, res) => {
    res.cookie('access_token', '', { maxAge: -1 })
    res.cookie('logged_out', '1', { maxAge: 30 * 1000 })
    res.redirect(303, '/')
})

export = router