interface VideoData{
    title: string,
    url: string,
    id: string,
    thumbnail: {
        url: string,
    }
    duration_seconds: string,
    channel: {
        name: string,
        url: string
    }
}
interface Format{
    itag: number,
    quality: string,
    qualityLabel: string,
    audioBitrate: number,
    container: string,
    videoCodec: string,
    isLive: boolean,
    hasVideo: boolean,
    hasAudio: boolean,
    fps: number,
    audioSampleRate: string
}
interface GroupedFormats{
    video: Format[],
    videoOnly: Format[],
    audioOnly: Format[],
}
enum ButtonType {
    Paste,
    Search
}
const YoutubeUrlRegex = /(youtu\.be\/|youtube\.com\/(watch\?(.*&)?v=|(embed|v)\/))([^\?&"'>]+)/

window.addEventListener('click', e => {
    document.querySelectorAll('div.qualities').forEach(el => {
        el.classList.remove('active')
    })
})

const yt_url: null|HTMLInputElement = document.querySelector('#youtubeUrl')
const videos_container = document.querySelector('#youtubeVideos')
addEventListener('load', (e) => {
    if(!yt_url) return
    if(yt_url.value.length > 0) changeButton(ButtonType.Search)
    else changeButton(ButtonType.Paste)
    if(videos_container) for(let i = sessionStorage.length - 1; i >= 0; i--){
        const item = sessionStorage.getItem(`youtube_video=${i}`)
        if(!item) return
        const [video, formats] = JSON.parse(item)
        videos_container.appendChild(createHTMLYoutubeVideo(video, formats))
    }
})

function saveVideoLocally(video: VideoData, formats: GroupedFormats): void{
    sessionStorage.setItem(`youtube_video=${sessionStorage.length}`, JSON.stringify([video, formats]))
}

function convertTime(time: number){
    const doubleDigit = (num: number) => num <= 9 ? `0${num}` : num
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor(time / 60) - hours*60
    const seconds = time - hours*3600 - minutes*60
    if(hours > 0) return `${doubleDigit(hours)}:${doubleDigit(minutes)}:${doubleDigit(seconds)}`
    if(minutes > 0) return `${doubleDigit(minutes)}:${doubleDigit(seconds)}`
    return `0:${doubleDigit(seconds)}`
}

function changeButton (type: ButtonType){
    const buttons: null|HTMLDivElement = document.querySelector('.yt-input-buttons[data-display]')
    if(!buttons) return;
    if(buttons.dataset.display == 'paste'){
        if(type === ButtonType.Paste) return
        buttons.dataset.display = 'search'
    }else{
        if(type === ButtonType.Search) return
        buttons.dataset.display = 'paste'
    }
}

function groupFormats(formats: any[]): GroupedFormats{
    const audioOnly: Format[] = []
    const videoOnly: Format[] = []
    const video: Format[] = []
    const video_resolutions: string[] = []
    formats.forEach(format => {
        if(format.hasAudio && format.hasVideo) {
            video.push(format);
            //video_resolutions.push(format.quality)
        }
        if(format.hasAudio && !format.hasVideo) audioOnly.push(format);
        if(!format.hasAudio && format.hasVideo) videoOnly.push(format);
    })
    return ({ 
                video,
                videoOnly: videoOnly.filter((format) => {
                    if(video_resolutions.includes(format.quality)) return false
                    video_resolutions.push(format.quality)
                    return true
                }),
                audioOnly 
            }) as GroupedFormats
}

function formatVideoData(data: any): VideoData{
    const thumbnail_url = data.thumbnails[(data.thumbnails?.length >= 3 ? 1 : data.thumbnails?.length - 1)]?.url
    return ({
        id: data.videoId,
        title: data.title,
        url: data.video_url,
        thumbnail: {
            url: thumbnail_url
        },
        duration_seconds: data.lengthSeconds,
        channel: {
            name: data.ownerChannelName,
            url: data.author.channel_url
        }
    }) as VideoData
}
function forceDownload(url: string, file_name: string) {
    const a = document.createElement('a');
    a.setAttribute('download', file_name);
    a.setAttribute('href', url);
    document.body.appendChild(a);
    a.click();
    a.remove();
}
function downloadFormat(video: VideoData, formats: GroupedFormats, format_itag: number, callback: () => void){
    const format = [...formats.video, ...formats.videoOnly, ...formats.audioOnly].find(format => format.itag === format_itag)
    if(!format) return
    // show popup
    callback()
}
function createHTMLYoutubeVideo(video: VideoData, formats: GroupedFormats): HTMLDivElement{
    const video_url = video.url
    const thumbnail_url = video.thumbnail.url
    const title = video.title
    const duration = convertTime(Number(video.duration_seconds))
    const channel = video.channel.name
    const channel_url = video.channel.url
    let best_available_format = formats.video[formats.video.length - 1]
    formats.video.forEach(format => {
        if(Number(format.qualityLabel.split('p')[0]) > Number(best_available_format.qualityLabel.split('p')[0])) best_available_format = format
    })
    //
    const video_elem = document.createElement('div')
    video_elem.classList.add('youtube-video')
    //
    const info_elem = document.createElement('div')
    info_elem.classList.add('youtube-video-info')
    //
    const thumbn_elem = document.createElement('div')
    thumbn_elem.classList.add('youtube-video-thumbnail')
    const thumbn_img = document.createElement('img')
    thumbn_img.addEventListener('click', e => window.open(video_url, '_blank'))
    thumbn_img.setAttribute('src', thumbnail_url)
    thumbn_elem.appendChild(thumbn_img)
    info_elem.appendChild(thumbn_elem)
    //
    const video_data_elem = document.createElement('div')
    video_data_elem.classList.add('youtube-video-data')
    //
    const video_title = document.createElement('a')
    video_title.classList.add('youtube-video-title')
    video_title.setAttribute('href', video_url)
    video_title.setAttribute('target', '_blank')
    video_title.setAttribute('title', title)
    video_title.innerText = title
    video_data_elem.appendChild(video_title)
    const video_duration = document.createElement('p')
    video_duration.classList.add('youtube-video-duration')
    video_duration.innerText = duration
    video_data_elem.appendChild(video_duration)
    const author_span = document.createElement('span')
    author_span.classList.add('youtube-video-author')
    const video_author = document.createElement('a')
    video_author.setAttribute('href', channel_url)
    video_author.setAttribute('target', '_blank')
    video_author.setAttribute('title', channel)
    video_author.innerText = channel
    author_span.appendChild(video_author)
    video_data_elem.appendChild(author_span)
    //
    info_elem.appendChild(video_data_elem)
    video_elem.appendChild(info_elem)
    //
    const options_elem = document.createElement('div')
    options_elem.classList.add('youtube-video-options')
    //
    const download_button = document.createElement('button')
    download_button.classList.add('download-format')
    download_button.dataset.format = String(best_available_format.itag)
    download_button.addEventListener('click', e => downloadFormat(video, formats, Number(download_button.dataset.format), () => {
        const format = String(download_button.dataset.format)
        const file_name = title + '.' + best_available_format.container
        fetch(`/api/youtube/download/${encodeURIComponent(video.url)}?filename=${file_name}&format=${format}`, {
            method: 'GET',
          }).then(async resp => {
            if(resp.ok) return await resp.blob()
            else return await resp.json()
          }).then(data => {
            if(!(data instanceof Blob)) throw new Error(`${data.error}, ${data.message}`)
            const url = URL.createObjectURL(data)
            forceDownload(url, file_name);
        }).catch(e => console.error(e));
    }))
    const download_icon = document.createElement('img')
    download_icon.setAttribute('src', '/assets/images/download.svg')
    download_button.appendChild(download_icon)
    //
    const quality_drpdwn = document.createElement('div')
    quality_drpdwn.classList.add('youtube-video-quality')
    const slctd_quality = document.createElement('div')
    slctd_quality.classList.add('selected-quality')
    // 
    const slctd_quality_val = document.createElement('p')
    const setSelectedQuality = (format: Format) => {
        download_button.dataset.format = String(format.itag)
        download_button.dataset.container = String(format.container)
        console.log(format)
        if(format.hasVideo) slctd_quality_val.innerText = `${format.qualityLabel} ${format.container}`
        else slctd_quality_val.innerText = `${format.audioBitrate}kbps`
    }
    setSelectedQuality(best_available_format)
    const select_chevron = document.createElement('img')
    select_chevron.setAttribute('src', '/assets/images/chevron-down.svg')
    slctd_quality.appendChild(slctd_quality_val)
    slctd_quality.appendChild(select_chevron)
    //
    const qualities = document.createElement('div')
    qualities.classList.add('qualities')
    const createQualityElement = (name: string, itag: number, container: string, fps: null|number = null, tags: string[] = []) => {
        const quality = document.createElement('div')
        quality.classList.add('quality')
        const p = document.createElement('p')
        p.appendChild(document.createTextNode(name))
        if(fps) {
            const spanfps = document.createElement('span')
            spanfps.classList.add('fps')
            spanfps.innerText = String(fps)
            p.appendChild(spanfps)
        }
        quality.appendChild(p)
        const chips = document.createElement('div')
        chips.classList.add('quality-chips')
        if(tags.includes('HDR')){
            const chip = document.createElement('span')
            chip.classList.add('chip')
            chip.innerText = String('HDR')
            ///chips.appendChild(chip)
        }
        if(tags.includes('LOGIN')){
            const chip = document.createElement('span')
            chip.classList.add('chip')
            chip.innerText = String('Free')
            chips.appendChild(chip)
        }
        quality.appendChild(chips)
        quality.addEventListener('click', (e) => {
            const format = [...formats.video, ...formats.videoOnly, ...formats.audioOnly].find(el => el.itag === itag)
            if(!format || (format.hasVideo && !format.hasAudio)) return
            setSelectedQuality(format)
        })
        return quality
    }
    formats.video.forEach((format: Format) => qualities.appendChild(createQualityElement(format.qualityLabel, format.itag, format.container)));
    formats.audioOnly.forEach((format: Format) => {
        const name = `${format.audioBitrate}kbps`
        qualities.appendChild(createQualityElement(name, format.itag, format.container))
    });
    formats.videoOnly.forEach((format: Format) => {
        let name = format.qualityLabel
        let fps = null
        const tags = []
        if(name.includes('HDR')){ name = name.split('HDR')[0]; tags.push('HDR') }
        if(name.includes('p50')){ fps = 50; name = name.split('p50')[0] + 'p' }
        if(name.includes('p60')){ fps = 60; name = name.split('p60')[0] + 'p' }
        tags.push('LOGIN')
        qualities.appendChild(createQualityElement(name, format.itag, format.container, fps, tags))
    });
    slctd_quality.addEventListener('click', e => {
        e.stopPropagation()
        qualities.classList.toggle('active')
    })
    quality_drpdwn.appendChild(slctd_quality)
    quality_drpdwn.appendChild(qualities)
    options_elem.appendChild(quality_drpdwn)
    options_elem.appendChild(download_button)
    //
    video_elem.appendChild(options_elem)
    return video_elem
}

let last_searched_url = ''
async function searchYtUrl(url: string): Promise<boolean>{
    if(url == last_searched_url) return true
    last_searched_url = url
    try{
        const data = await fetch(`/api/youtube/search/${encodeURIComponent(url)}`).then(async res => {
            const data = await res.json()
            if(res.ok) return data;
            throw new Error(`Code: ${data?.error}, ${data?.message}`)
        }).catch(er => Error(er))
        if(data instanceof Error) throw data;
        const video = formatVideoData(data.video);
        const formats = groupFormats(data.formats)
        saveVideoLocally(video, formats)
        if(videos_container) videos_container.insertBefore(createHTMLYoutubeVideo(video, formats), videos_container.querySelector('div'))
        return true
    }catch(err){
        console.error(err)
        return false
    }
}

async function trySearchUrl(): Promise<void> {
    const url = yt_url?.value || ''
    if(!YoutubeUrlRegex.test(url)) {
        const messages: null|HTMLDivElement = document.querySelector('#youtubeUrlMessage')
        const input: null|HTMLInputElement = document.querySelector('#youtubeUrl')
        if(!input || !messages) return
        input.style.animation = ''
        setTimeout(() => input.style.animation = 'bounce .2s ease', 1)
        messages.dataset.message = 'invalid-url'
        return
    }
    const messages: null|HTMLDivElement = document.querySelector('#youtubeUrlMessage')
    if(messages) messages.dataset.message = 'loading'
    const is_valid = await searchYtUrl(url);
    if(!messages) return
    if(is_valid) messages.dataset.message = ''
    else messages.dataset.message = 'not-found'
    return
}

async function pasteYtUrl(){
    if(!yt_url) return;
    const text = (await navigator.clipboard.readText())?.trim()
    if(text.length < 1) return;
    yt_url.value = text
    changeButton(ButtonType.Search)
    yt_url.focus()
    trySearchUrl()
}

yt_url?.addEventListener('input', (e) => {
    changeButton(yt_url.value.length === 0 ? ButtonType.Paste : ButtonType.Search)
    const messages: null|HTMLDivElement = document.querySelector('#youtubeUrlMessage')
    if(!messages) return
    messages.dataset.message = ''
})
yt_url?.addEventListener('keypress', (e) => {
    if(e.key !== 'Enter' || yt_url.value.length == 0) return
    trySearchUrl()
})