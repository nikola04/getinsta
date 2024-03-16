import { Router, urlencoded, Request, Response } from 'express';
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
    const found = await User.findOne({ "google.id": userId }).lean()
    if(found) {
        if(googleUser.picture && found.google.picture != googleUser.picture){
            const google = {
                ...found.google,
                picture: googleUser.picture
            }
            const picture = {
                ...found.picture,
                url: found.picture.source === PictureSource.Google ? googleUser.picture : found.picture.url
            }
            await User.updateOne({ _id: found._id }, { $set: { google, picture }})
            found.google.picture = googleUser.picture
        }
        return found
    }
    return await User.create({
        google: {
            id: userId,
            email: googleUser.email,
            picture: googleUser.picture
        },
        email: googleUser.email,
        verified_email: true,
        name: googleUser.name,
        picture: {
            url: googleUser.picture,
            source: googleUser.picture ? PictureSource.Google : null
        }
    })
}

router.post('/login', rateLimit({
    endpoint: '/login',
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
        const { credential, g_csrf_token }: ({ credential: null|string, g_csrf_token: null|string }) = req.body
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