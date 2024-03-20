import { Router, Request, Response, urlencoded } from 'express';
import { rateLimit } from '../../middlewares/ratelimit';
import Newsletter from '../../../schemas/newsletter';
import { validateCaptchaToken, validateCatpchaResponse } from '../../functions/recaptcha';
import { logAPI } from '../../middlewares/apilog';
import { EmailRegex } from '../../constants/regex';

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
}, false), logAPI('newsletter/subscribe'), urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try{
        const email: null|string = req.body?.email
        const token: null|string = req.body?.token
        if(!email) return res.status(400).json({ error: 0, message: 'Email is not provided.' })
        if(!token) return res.status(400).json({ error: 1, message: 'Token is not provided.' })
        if(!EmailRegex.test(email)) return res.status(400).json({ error: 2, message: 'Email is not valid.' })
        const ip = req.ip
        const tokenResponse = await validateCaptchaToken({ token, ip })
        if(!validateCatpchaResponse(tokenResponse, 'newsletter_subscribe')) return res.status(403).json({ error: 3, message: 'Bot detected.' })
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