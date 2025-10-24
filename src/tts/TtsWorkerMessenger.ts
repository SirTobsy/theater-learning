export class TtsWorkerMessenger {
    private worker: Worker;
    private requestId = 0; // TODO uuid?

    constructor() {
        this.worker = new Worker(new URL('./TtsWorker.ts', import.meta.url), { type: 'module' });
    }

    async load(): Promise<boolean> {
        const startTime = performance.now();

        return new Promise((resolve, reject) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'tts-ready') {
                    this.worker.removeEventListener('message', handler);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    console.log(`TTS loading took ${duration.toFixed(2)}ms`);
                    resolve(true);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'load-model' });
        });
    }

    async generate(text: string): Promise<any> {
        const id = this.requestId++;
        const startTime = performance.now();

        return new Promise((resolve, reject) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type ==='audio' && event.data.requestId === id) {
                    this.worker.removeEventListener('message', handler);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    console.log(`TTS generation took ${duration.toFixed(2)}ms`);
                    resolve(event.data.audio);
                }
            };

            this.worker.addEventListener('message', handler);
            this.worker.postMessage({ type: 'generate', text, requestId: id });
        });
    }
}