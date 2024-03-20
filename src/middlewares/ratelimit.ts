import { Request, Response, NextFunction } from 'express'
import path from 'path';
import { createClient } from 'redis';

const redisClient = createClient().on('error', err => console.log('Redis Client Error', err))

export interface RateLimit {
    endpoint: string,
    rateLimits: {
        loggedIn: {
            time: number,
            limit: number
        },
        anonymous: null|{
            time: number,
            limit: number
        }
    }
}

export function rateLimit(rule: RateLimit, sendPageOnError: boolean = true){
    return async function(req: Request, res: Response, next: NextFunction){
        if(!redisClient.isReady) await redisClient.connect()
        const key = `${(req.signedIn ? req.user?._id : 'anonym')}@${req.ip}#${rule.endpoint}`
        const requests: number = await redisClient.incr(key)
        const rateLimit = req.signedIn ? rule.rateLimits.loggedIn : rule.rateLimits.anonymous
        if(rateLimit == null) return next()
        if(requests === 1){
            await redisClient.pExpire(key, rateLimit?.time)
        }else if(requests > rateLimit.limit){
            if(sendPageOnError) res.status(429).sendFile(path.resolve('src/views/429.html'))
            else res.sendStatus(429)
            return
        }
        next()
    }
}