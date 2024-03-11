import express, { Request, Response } from 'express'
import env from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
// routers
import youtubeRouter from './src/routes/youtube'
import authRouter from './src/routes/apis/auth'
import youtubeApiRouter from './src/routes/apis/youtube'
import newsletterApiRouter from './src/routes/apis/newsletter'
import { authenticate } from './src/middlewares/authenticate'
import { rateLimit } from './src/middlewares/ratelimit'
import path from 'path'

env.config()
const app = express()

if(process.env.MONGO_URI) mongoose.connect(process.env.MONGO_URI).then(() => console.log('🔥 Database Connected'));

app.set('trust proxy', true)
app.set('views', 'src/views')
app.use(express.static('global'))
app.use(express.static('public'))
app.use(cookieParser())
app.use(authenticate)
app.use('/auth', authRouter)
app.use('/youtube', youtubeRouter)
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
    res.render('index.ejs', { googleId: process.env.G_CLIENT_ID, googleRecaptchaKey: process.env.RECAPTCHA_KEY, signedIn: req.signedIn, user: req.user })
})

app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, './documents/privacy-policy.html')))
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, './documents/tos.html')))

app.listen(process.env.PORT, () => {
    console.log('🔥 Server Started:', process.env.PORT)
})