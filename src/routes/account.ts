import { Router } from 'express';
import { rateLimit } from '../middlewares/ratelimit';
const router = Router()

router.get('/', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'info', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

router.get('/edit/name', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'info/edit/name', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})
router.get('/edit/email', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'info/edit/email', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})
router.get('/edit/picture', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'info/edit/picture', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

router.get('/settings', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
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
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'subscriptions', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})
router.get('/downloads', rateLimit({
    endpoint: '/',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 5
        },
        anonymous: null
    }
}), (req, res) => {
    if(!req.signedIn) return res.redirect('/')
    res.render('account.ejs', { page: 'downloads', googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})


export = router