export default class Network {
    constructor() {
        this.socket = io();
        this.id = null;
        this.socket.on('connect', () => {
            this.id = this.socket.id;
            console.log('Connected', this.id);
        });
    }
    on(event, cb) { this.socket.on(event, cb); }
    emit(event, payload) { this.socket.emit(event, payload); }
}