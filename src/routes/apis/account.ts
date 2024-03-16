import { Router, Request, Response, urlencoded } from 'express';
import { rateLimit } from '../../middlewares/ratelimit';
import { validateCaptchaToken, validateCatpchaResponse } from '../../functions/recaptcha';
import User from '../../../schemas/user';

const EmailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
const router = Router()

router.delete('/', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: {
            time: 1000,
            limit: 1
        }
    }
}), urlencoded({ extended: true }), async (req: Request, res: Response) => {
    try{
        if(!req.signedIn) return res.status(401).json({ error: 1, message: "User is not logged in." })
        const deleted = await User.deleteOne({ _id: req.user._id })
        if(!deleted) throw new Error("Error while deleting")
        return res.sendStatus(200)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: 0, message: String(err) })
    }
})

export = router