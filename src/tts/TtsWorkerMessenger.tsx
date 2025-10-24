export class TtsWorkerMessenger {
    private worker: Worker;
    private requestId = 0; // TODO uuid?

    constructor() {
        this.worker = new Worker(new URL('./TtsWorker.ts', import.meta.url), { type: 'module' });
    }

    async load(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'tts-ready') {
                    this.worker.removeEventListener('message', handler);
                    resolve(true);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'load-model' });
        });
    }

    async generate(text: string): Promise<any> {
        const id = this.requestId++;
        return new Promise((resolve, reject) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type ==='audio' && event.data.requestId === id) {
                    this.worker.removeEventListener('message', handler);
                    resolve(event.data.audio);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'generate', text, requestId: id });
        });
    }
}