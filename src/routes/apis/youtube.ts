import { Router, Request, Response } from 'express';
import cors from 'cors'
import ytdl, { videoInfo } from 'ytdl-core';
import { rateLimit } from '../../middlewares/ratelimit';
import { validateCaptchaToken, validateCatpchaResponse } from '../../functions/recaptcha';
import { logAPI } from '../../middlewares/apilog';
import { EventType, StreamType, mergeVideoAndAudio } from '../../classes/video_converter';
import { v4 } from 'uuid';
import { MAX_FILE_SIZE, TEMP_FOLDER } from '../../constants/dir';
import { PathLike, rmSync } from 'fs';
import path from 'path';

const router = Router()
router.use(cors())

router.get('/convert/:url', rateLimit({
    endpoint: '/youtube/convert',
    rateLimits: {
        loggedIn: {
            time: 1000,
            limit: 1
        },
        anonymous: {
            time: 1000,
            limit: 3
        }
    }
}, false), logAPI('youtube/convert'), async (req: Request, res: Response) => {
    try{
        const url = String(req.params.url);
        const fileName: string = String(req.query.filename);
        const formatItag: number = Number(req.query.format);
        const token = req.query.token;
        if(!url || !ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'YouTube url is not valid.'})
        if(!fileName || !formatItag) return res.status(400).json({ error: '1', message: 'ValidFile name or format is not provided.'})
        // if(!token || typeof token !== 'string') return res.status(400).json({ error: '1', message: 'reCAPTCHA token is not provided.'})
        // const tokenResponse = await validateCaptchaToken({ token, ip: req.ip })
        // if(!validateCatpchaResponse(tokenResponse, 'youtube_download')) return res.status(403).json({ error: 2, message: 'Bot detected.' })
        const info: videoInfo|null = await ytdl.getInfo(url).catch(err => null)
        if(!info) return res.status(400).json({ error: '1', message: 'YouTube video is not found'})
        const filtered_formats = ytdl.filterFormats(info.formats, (f) => f.quality == 'hd1080')
        if(filtered_formats.length == 0) return res.status(400).json({ error: '1', message: 'YouTube video format is not found'})
        const videoFormat = filtered_formats[0]
        if(!Number(videoFormat.contentLength) || Number(videoFormat.contentLength) > MAX_FILE_SIZE) return res.status(400).json({ error: '1', message: `Provided format is too big. File size is exceeding ${MAX_FILE_SIZE} bytes.`})
        console.log(videoFormat.itag, videoFormat.contentLength)
        const videoStream = ytdl.downloadFromInfo(info, ({
            format: videoFormat
        }))
        const audioStream = ytdl.downloadFromInfo(info, ({
            filter: 'audioonly',
            quality: 'highestaudio'
        }))
        const fileDirectory: PathLike = path.join(TEMP_FOLDER, v4() + '.mp4')
        const merge = new mergeVideoAndAudio(fileDirectory)
        merge.on(EventType.Spawn, () => {

        })
        merge.on(EventType.Finished, () => {
            merge.destroy()
        })
        merge.pipe(audioStream, StreamType.Audio)
        merge.pipe(videoStream, StreamType.Video)
        res.send('ok')
    }catch(err){
        console.error(err)
        return res.status(500).json({ error: '4', message: String(err) })
    }
})

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
}, false), logAPI('youtube/download'), async (req: Request, res: Response) => {
    try{
        const url = String(req.params.url);
        const fileName: string = String(req.query.filename);
        const format: number = Number(req.query.format);
        const token = req.query.token;
        if(!url || !ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'YouTube url is not valid.'})
        if(!fileName || !format) return res.status(400).json({ error: '1', message: 'File name or format is not provided.'})
        if(!token || typeof token !== 'string') return res.status(400).json({ error: '1', message: 'reCAPTCHA token is not provided.'})
        const tokenResponse = await validateCaptchaToken({ token, ip: req.ip })
        if(!validateCatpchaResponse(tokenResponse, 'youtube_download')) return res.status(403).json({ error: 2, message: 'Bot detected.' })
        res.setHeader('Content-Disposition', `attachment; filename="getinsta.xyz_${encodeURIComponent(fileName)}"`);
        const info: videoInfo|null = await ytdl.getInfo(url).catch(err => null)
        if(!info) return res.status(400).json({ error: '1', message: 'YouTube video is not found'})
        const filtered_formats = ytdl.filterFormats(info.formats, (f) => f.itag === format)
        if(filtered_formats.length == 0) return res.status(400).json({ error: '1', message: 'YouTube video format is not found'})
        const downloadableFormat = filtered_formats[0]
        console.log(downloadableFormat.contentLength)
        if(!Number(downloadableFormat.contentLength) || Number(downloadableFormat.contentLength) > MAX_FILE_SIZE) return res.status(400).json({ error: '1', message: `Provided format is too big. File size is exceeding ${MAX_FILE_SIZE} bytes.`})
        ytdl.downloadFromInfo(info, {
            format: downloadableFormat
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
}, false), logAPI('youtube/search'), async (req: Request, res: Response) => {
    try{
        const url = String(req.params.url)
        const token = req.headers['captcha-token']
        if(!ytdl.validateURL(url)) return res.status(400).json({ error: '0', message: 'YouTube video url is not valid.'})
        if(!token || typeof token !== 'string') return res.status(400).json({ error: '1', message: 'reCAPTCHA token header is not specified.'})
        const tokenResponse = await validateCaptchaToken({ token, ip: req.ip })
        if(!validateCatpchaResponse(tokenResponse, 'youtube_search')) return res.status(403).json({ error: 2, message: 'Bot detected.' })
        const id = ytdl.getVideoID(url)
        if(!id) return res.status(400).json({ error: '3', message: 'YouTube video url is not valid.'})
        const info: videoInfo|null = await ytdl.getInfo(id).catch(err => null)
        if(!info) return res.status(404).json({ error: '4', message: 'Provided YouTube video ID is not found.'})
        const filtered_formats = ytdl.filterFormats(info.formats, (f) => Number(f.contentLength) <= MAX_FILE_SIZE)
        res.status(200).json({ video: info.videoDetails, formats: filtered_formats })
    }catch(err){
        console.log(err)
        return res.status(500).json({ code: 5, message: String(err) })
    }
})


export = router