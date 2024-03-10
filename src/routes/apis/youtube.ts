import { Router, Response } from 'express';
import cors from 'cors'
import ytdl, { videoInfo } from 'ytdl-core';
import { rateLimit } from '../../middlewares/ratelimit';
import ffmpeg from 'ffmpeg-static'
import { spawn } from 'child_process';
import { Readable } from 'stream';

const router = Router()

router.use(cors())

const handleSeparateStreams = (videoStream: Readable, audioStream: Readable, res: Response) => {
    // if(!ffmpeg) return
    // const ffmpegProcess = spawn('ffmpeg', [
    //     // Remove ffmpeg's console spamming
    //     '-loglevel', '0', '-hide_banner',
    //     '-i', 'pipe:3',
    //     '-i', 'pipe:4',
    //     // '-strict experimental',
    //     // Choose some fancy codes
    //     '-c:v', 'copy',
    //     '-c:a', 'aac',
    //     // Define output container
    //     '-f', 'matroska', 'pipe:5',
    //   ], {
    //     windowsHide: true,
    //     stdio: [
    //       /* Standard: stdin, stdout, stderr */
    //       'inherit', 'inherit', 'inherit',
    //       /* Custom: pipe:3, pipe:4, pipe:5 */
    //       'pipe', 'pipe', 'pipe',
    //     ],
    //   });
      
    //   // Link streams
    //   // FFmpeg creates the transformer streams and we just have to insert / read data
    //   audioStream.pipe(ffmpegProcess.stdio[3]);
    //   videoStream.pipe(ffmpegProcess.stdio[4]);
    //   ffmpegProcess.stdio[5].pipe(res);
}

router.get('/download/:url', rateLimit({
    endpoint: '/youtube/download',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: {
            time: 1000,
            limit: 5
        }
    }
}, false), async (req, res) => {
    try{
        const url = String(req.params.url);
        const fileName: string = String(req.query.filename);
        const format: number = Number(req.query.format);
        if(!url || !ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'Please enter valid YouTube url.'})
        if(!fileName || !format) return res.status(400).json({ error: '1', message: 'Please enter valid file name and format.'})
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
        ytdl(url, {
            filter: (f) => f.itag === format,
        }).on('progress', (_, downloaded, total) => !res.headersSent && res.setHeader('Content-Length', total)).on('error', err => {
            res.removeHeader('Content-Disposition')
            if(err.message.includes('No such format found')) return res.status(404).send({ error: '2', message: 'No such format found.' })
            return res.status(500).send({ error: '3', message: 'Server error while getting format.' })
        }).pipe(res)
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: '4', message: String(err) })
    }
})

router.get('/search/:url', rateLimit({
    endpoint: '/youtube/search',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: {
            time: 500,
            limit: 5
        }
    }
}, false), async (req, res) => {
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
