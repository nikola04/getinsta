import { Router } from 'express';
const router = Router()

router.get('/:url', (req, res) => {
    res.render('youtube.ejs', { url: req.params.url })
})

router.get('/', (req, res) => {
    res.render('youtube.ejs')
})


export = router