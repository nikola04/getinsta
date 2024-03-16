import { Router, Request, Response, urlencoded, json } from 'express';
import { rateLimit } from '../../middlewares/ratelimit';
import { validateCaptchaToken, validateCatpchaResponse } from '../../functions/recaptcha';
import User from '../../../schemas/user';

const EmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const router = Router()

router.use(json())

router.delete('/', rateLimit({
    endpoint: '/account/delete',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 1, message: 'User is not logged in.' })
        const deleted = await User.deleteOne({ _id: req.user._id })
        if(!deleted) throw new Error('Error while deleting')
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

router.patch('/email', rateLimit({
    endpoint: '/account/email',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        const email: null|string = req.body?.email
        if(!email || !EmailRegex.test(email)) return res.status(400).json({ error: 1, message: 'Valid Email is not provided.' })
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 2, message: 'User is not logged in.' })
        await User.updateOne({ _id: req.user._id }, { $set: { email, verified_email: false }})
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

router.patch('/name', rateLimit({
    endpoint: '/account/name',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: null
    }
}, false), async (req: Request, res: Response) => {
    try{
        const name: null|string = req.body?.name
        if(!name || name.length < 2 || name.length > 32) return res.status(400).json({ error: 1, message: 'Valid Name is not provided.' })
        if(!req.signedIn || !req.user) return res.status(401).json({ error: 2, message: 'User is not logged in.' })
        await User.updateOne({ _id: req.user._id }, { $set: { name }})
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

export = router