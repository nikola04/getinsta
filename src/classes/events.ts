export class EventEmitter {
    private eventsMap = new Map()
    public on(event: string, callback: () => void) {
        const listeners: null|[() => void] = this.eventsMap.get(event)
        if(listeners == null) return this.eventsMap.set(event, [callback])
        listeners.push(callback)
        this.eventsMap.set(event, listeners)
    }
    public removeAllListeners(event: string){
        this.eventsMap.delete(event)
    }
    public emit(event: string) {
        const listeners = this.eventsMap.get(event)
        if(!listeners) return
        listeners.forEach((listener: () => void) => listener());
    }
    public destroy(){
        this.eventsMap.clear()
    }
}