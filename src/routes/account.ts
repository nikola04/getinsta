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
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'info', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

router.get('/settings', rateLimit({
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
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'settings', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

router.get('/subscriptions', rateLimit({
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
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'subscriptions', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})


export = router