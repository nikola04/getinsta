import { NextFunction, Request, Response } from "express";
import ApiCall from "../../schemas/apicall";

export function logAPI(api: string){
    return function (req: Request, res: Response, next: NextFunction){
        const ip = req.ip
        const ua = req.headers['user-agent']
        const account_id = req.signedIn ? req.user._id : null
        ApiCall.create({
            api,
            account_id,
            ip,
            ua
        })
        next()
    }
}