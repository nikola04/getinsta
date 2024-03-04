import { Router } from 'express';
import cors from 'cors'
import ytdl from 'ytdl-core';

const router = Router()

router.use(cors())

router.get('/download/:url', async (req, res) => {
    try{
        const url = String(req.params.url);
        const file_name: string = String(req.query.filename);
        const format: number = Number(req.query.format);
        if(!url || !ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'Please enter valid YouTube url.'})
        if(!file_name || !format) return res.status(400).json({ error: '1', message: 'Please enter valid file name and format.'})
        res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(file_name)}"`);
        ytdl(url, {
            filter: (f) => f.itag === format,
        }).on('response', response => res.setHeader('Content-Length', response.headers["content-length"])).on('error', err => {
            res.removeHeader('Content-Disposition')
            if(err.message.includes('No such format found')) return res.status(404).send({ error: '2', message: 'No such format found.' })
            return res.status(500).send({ error: '3', message: 'Server error while getting format.' })
        }).pipe(res)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: '4', message: String(err) })
    }
})

router.get('/search/:url', async (req, res) => {
    try{
        const url = String(req.params.url)
        if(!ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'Please enter valid YouTube video url.'})
        const id = ytdl.getVideoID(url)
        if(!id) return res.status(400).json({ error: '0', message: 'Please enter valid YouTube video url.'})
        const info = await ytdl.getInfo(id).catch(err => null)
        if(!info) return res.status(404).json({ error: '1', message: 'There is no YouTube video with provided ID.'})
        res.status(200).json({ video: info.videoDetails, formats: info.formats })
    }catch(err){
        console.log(err)
        return res.status(500).json({ code: 2, message: String(err) })
    }
})


export = router