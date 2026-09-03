export class TtsWorkerMessenger {
    private worker: Worker;
    private requestId = 0; // TODO uuid?

    constructor() {
        this.worker = new Worker(new URL('./TtsWorker.ts', import.meta.url), { type: 'module' });

        // Add global error handler for the worker
        this.worker.addEventListener('error', (error) => {
            console.error('Worker error:', error);
        });
    }

    async load(): Promise<boolean> {
        const startTime = performance.now();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.worker.removeEventListener('message', handler);
                this.worker.removeEventListener('error', errorHandler);
                reject(new Error('TTS loading timeout'));
            }, 90*1000); // 90 second timeout

            const handler = (event: MessageEvent) => {
                if (event.data.type === 'tts-ready') {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handler);
                    this.worker.removeEventListener('error', errorHandler);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    console.log(`TTS loading took ${duration.toFixed(2)}ms`);
                    resolve(true);
                } else if (event.data.type === 'error') {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handler);
                    this.worker.removeEventListener('error', errorHandler);
                    reject(new Error(event.data.message || 'TTS loading failed'));
                }
            };

            const errorHandler = (error: ErrorEvent) => {
                clearTimeout(timeout);
                this.worker.removeEventListener('message', handler);
                this.worker.removeEventListener('error', errorHandler);
                reject(new Error(`Worker error: ${error.message}`));
            };

            this.worker.addEventListener('message', handler);
            this.worker.addEventListener('error', errorHandler);
            this.worker.postMessage({ type: 'load-model' });
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async generate(text: string): Promise<any> {
        const id = this.requestId++;
        const startTime = performance.now();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.worker.removeEventListener('message', handler);
                this.worker.removeEventListener('error', errorHandler);
                reject(new Error('TTS generation timeout'));
            }, 90*1000); // 90 second timeout

            const handler = (event: MessageEvent) => {
                if (event.data.type === 'audio' && event.data.requestId === id) {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handler);
                    this.worker.removeEventListener('error', errorHandler);
                    const endTime = performance.now();
                    const duration = endTime - startTime;
                    console.log(`TTS generation took ${duration.toFixed(2)}ms`);
                    resolve(event.data.audio);
                } else if (event.data.type === 'error' && event.data.requestId === id) {
                    clearTimeout(timeout);
                    this.worker.removeEventListener('message', handler);
                    this.worker.removeEventListener('error', errorHandler);
                    reject(new Error(event.data.message || 'TTS generation failed'));
                }
            };

            const errorHandler = (error: ErrorEvent) => {
                clearTimeout(timeout);
                this.worker.removeEventListener('message', handler);
                this.worker.removeEventListener('error', errorHandler);
                reject(new Error(`Worker error: ${error.message}`));
            };

            this.worker.addEventListener('message', handler);
            this.worker.addEventListener('error', errorHandler);
            this.worker.postMessage({ type: 'generate', text, requestId: id });
        });
    }
}
