import { Router } from 'express';
import { rateLimit } from '../middlewares/ratelimit';
import ytdl from 'ytdl-core';
const router = Router()

router.get('/', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: {
            time: 500,
            limit: 10
        }
    }
}), (req, res) => {
    const url = (req.query.url && ytdl.validateURL(String(req.query.url))) ? req.query.url : null
    res.render('youtube.ejs', { googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user, url })
})


export = router