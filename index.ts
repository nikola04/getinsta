import express, { Request, Response } from 'express'
import env from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import { randomBytes } from 'crypto'
// routers
import accountApiRouter from './src/routes/apis/account'
import accountRouter from './src/routes/account'
import youtubeRouter from './src/routes/youtube'
import authRouter from './src/routes/apis/auth'
import youtubeApiRouter from './src/routes/apis/youtube'
import newsletterApiRouter from './src/routes/apis/newsletter'
import { authenticate } from './src/middlewares/authenticate'
import { rateLimit } from './src/middlewares/ratelimit'
import path from 'path'
import helmet from 'helmet'

env.config()
const app = express()

if(process.env.MONGO_URI) mongoose.connect(process.env.MONGO_URI).then(() => console.log('🔥 Database Connected'));

const ga = 'https://www.google-analytics.com'
const gas = 'https://ssl.google-analytics.com'
const gtm = 'https://www.googletagmanager.com'

app.set('trust proxy', true)
app.set('views', 'src/views')
/* app.use((req, res, next) => {
//     const nonceHex = randomBytes(16).toString("hex")
//     res.locals.nonce = nonceHex
//     helmet({
//         contentSecurityPolicy: {
//             useDefaults: true,
//             directives: {
//                 scriptSrc: [
//                     '\'self\'',
//                     `https: 'unsafe-inline'`,
//                     'data:',
//                     ga,
//                     gas,
//                     gtm,
//                     'https://apis.google.com',
//                     'https://www.google.com/recaptcha/',
//                     'https://www.gstatic.com/recaptcha/',
//                 ],
//                 scriptSrcAttr: [
//                     '\'self\'',
//                     '\'unsafe-inline\'',
//                 ],
//                 fontSrc: ['\'self\'', 'https://fonts.googleapis.com/', 'https://fonts.gstatic.com/'],
//                 imgSrc: [
//                     '\'self\'',
//                     'data:',
//                     'https://*.googleusercontent.com/',
//                     'https://*.ytimg.com/',
//                     ga,
//                     gtm
//                 ],
//                 frameSrc: [
//                     '\'self\'',
//                     'data:',
//                     'https://www.google.com',
//                     'https://accounts.google.com',
//                     '\'unsafe-eval\''
//                 ],
//                 objectSrc: ["'none'"],
//                 connectSrc: ["'self'", 'data:', ga, 'https://accounts.google.com'],
//             }
//         }
//     })(req, res, next)
})*/
app.use(express.static('global'))
app.use(express.static('public'))
app.use(cookieParser())
app.use(authenticate)
app.use('/account', accountRouter)
app.use('/auth', authRouter)
app.use('/youtube', youtubeRouter)
app.use('/api/account', accountApiRouter)
app.use('/api/newsletter', newsletterApiRouter)
app.use('/api/youtube', youtubeApiRouter)

app.get('/', rateLimit({
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
}), (req: Request, res: Response) => {
    return res.redirect('/youtube')
    // res.render('index.ejs', { googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, './documents/privacy-policy.html')))
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, './documents/tos.html')))

app.listen(process.env.PORT, () => {
    console.log('🔥 Server Started:', process.env.PORT)
})