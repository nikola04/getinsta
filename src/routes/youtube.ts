import { Router } from 'express';
import { rateLimit } from '../middlewares/ratelimit';
const router = Router()

router.get('/:url', (req, res) => {
    res.render('youtube.ejs', { url: req.params.url })
})

router.get('/', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: {
            time: 500,
            limit: 15
        }
    }
}), (req, res) => {
    res.render('youtube.ejs', { googleId: process.env.G_CLIENT_ID, signedIn: req.signedIn, user: req.user })
})


export = router