import { Request, Response, NextFunction } from 'express'
import path from 'path';
import { createClient } from 'redis';

const redisClient = createClient().on('error', err => console.log('Redis Client Error', err))

export interface RateLimit {
    endpoint: string,
    rateLimits: {
        loggedIn?: {
            time: number,
            limit: number
        },
        anonymous?: {
            time: number,
            limit: number
        }
    }
}

export function rateLimit(rule: RateLimit, sendPageOnError: boolean = true){
    return async function(req: Request, res: Response, next: NextFunction): Promise<void>{
        if(!redisClient.isReady) await redisClient.connect()
        const key = `${(req.signedIn ? req.user?._id : 'anonym')}@${req.ip}#${rule.endpoint}`
        const requests: number = await redisClient.incr(key)
        const rateLimit = req.signedIn ? rule.rateLimits.loggedIn : rule.rateLimits.anonymous
        // If rateLimit is not defined
        if(rateLimit == null) return next()
        // If rate limit is just set or expiration date is not set(for some reason it happened)
        if(requests === 1 || (await redisClient.TTL(key) === -1)){
            await redisClient.pExpire(key, rateLimit?.time)
            return next()
        }
        if(requests <= rateLimit.limit) return next()
        // If page is needed, send html
        if(sendPageOnError) res.status(429).sendFile(path.resolve('src/views/429.html'))
        else res.sendStatus(429)
        return
    }
}