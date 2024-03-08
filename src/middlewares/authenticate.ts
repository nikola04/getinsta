import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import User, { UserData } from '../../schemas/user'
import { readFileSync } from 'fs';
const publicKey = readFileSync(__dirname + '/../../keys/jwtRS512.key', { encoding: 'utf8' });

async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void>{
    try{
        const access_token = req.cookies['access_token']
        if(access_token == null) throw new Error('No access token')
        const jwt_payload = jwt.verify(access_token, publicKey, { algorithms: ['RS512'] }) as JwtPayload
        if(!jwt_payload) throw new Error('No JWT payload')
        const userId = jwt_payload.userId
        const user = await User.findById(userId).lean()
        if(!user) throw new Error('No user found')
        req.signedIn = true
        req.user = user
        next()
    }catch(err){
        res.cookie('access_token', '', { maxAge: -1 })
        req.user = null
        req.signedIn = false
        next()
    }
}

module.exports = { authenticate }
export { authenticate }