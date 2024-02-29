import express from 'express'
import env from 'dotenv'

env.config()
const app = express()

app.set('views', 'src/views')
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('index.ejs')
})

app.listen(process.env.PORT, () => {
    console.log('🔥 Server started at Port:', process.env.PORT)
})