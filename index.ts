import express from 'express'
import env from 'dotenv'
// routers
import instagramRouter from './src/routes/instagram'
import youtubeRouter from './src/routes/youtube'
// api routers
import youtubeApiRouter from './src/routes/apis/youtube'

env.config()
const app = express()

app.set('views', 'src/views')

app.use(express.static('public'))
app.use('/instagram', instagramRouter)
app.use('/youtube', youtubeRouter)
app.use('/api/youtube', youtubeApiRouter)

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.listen(process.env.PORT, () => {
    console.log('🔥 Server started at Port:', process.env.PORT)
})