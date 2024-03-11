import { Router, Request, Response, urlencoded } from 'express';
import { rateLimit } from '../../middlewares/ratelimit';
import Newsletter from '../../../schemas/newsletter';
import { validateToken } from '../../functions/recaptcha';

const EmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const router = Router()

router.post('/', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1500,
            limit: 1
        },
        anonymous: {
            time: 500,
            limit: 3
        }
    }
}), urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try{
        const email: undefined|string = req.body.email
        const token: undefined|string = req.body.token
        if(!email) return res.status(400).json({ error: 0, message: 'Email is not provided.' })
        if(!token) return res.status(400).json({ error: 1, message: 'Token is not provided.' })
        if(!EmailRegex.test(email)) return res.status(400).json({ error: 2, message: 'Email is not valid.' })
        const ip = req.ip
        const response = await validateToken({ token, ip })
        if(!response || response.action != 'newsletter_subscribe' || !response.success) return res.status(403).json({ error: 3, message: 'Bot detected.' })
        const exist = await Newsletter.findOne({ email }).lean()
        if(exist != null) return res.status(409).json({ error: 3, message: 'Email is already subscribed.' })
        const subscription = ({
            email
        })
        await Newsletter.create(subscription)
        return res.status(200).json({ message: 'Successfully subscribed.'})
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 4, message: String(err) })
    }
})

export = router