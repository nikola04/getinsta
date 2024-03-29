import ffmpeg from 'ffmpeg-static'
import { ChildProcess, spawn } from 'child_process';
import { Readable, Writable } from 'stream';
import { EventEmitter } from './events';

export enum StreamType{
    Audio = 3,
    Video = 4
}

export enum EventType{
    Spawn = 'spawn',
    Finished = 'finished'
}

export class mergeVideoAndAudio {
    private ffmpegProcess: ChildProcess
    private directory: string
    private events: EventEmitter
    constructor(directory: string){
        this.events = new EventEmitter()
        this.directory = directory
        this.ffmpegProcess = spawn(ffmpeg, [
            '-loglevel', 'error',
            '-hide_banner',
            '-i', 'pipe:3', // Audio input
            '-i', 'pipe:4', // Video input
            '-c:v', 'copy', // Video codec
            '-c:a', 'aac', // Audio codec
            '-strict', 'experimental', // Required for some AAC codecs
            '-shortest', // Finish encoding when the shortest input stream ends
            this.directory
        ], {
            windowsHide: true,
            stdio: [ 'inherit', 'inherit', 'inherit', 'pipe', 'pipe', 'pipe' ]   
        });
        
        this.ffmpegProcess.on('spawn', () => {
            this.events.emit(EventType.Spawn)
        });
        this.ffmpegProcess.on('close', () => {
            this.events.emit(EventType.Finished)
        });
    }
    pipe(stream: Readable, type: StreamType){
        stream.pipe(this.ffmpegProcess.stdio[type] as Writable);
    }
    on(event: EventType, callback: () => void){
        this.events.on(event, callback)
    }
    removeAllListeners(event: EventType){
        this.events.removeAllListeners(event)
    }
    destroy(){
        this.events.destroy()
    }
}