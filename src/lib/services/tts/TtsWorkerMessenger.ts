import * as Comlink from 'comlink';
import type { TtsWorkerApi } from './TtsWorker';
import type {TtsModelId} from "#lib/services/tts/models.ts";

export class TtsWorkerMessenger {
    private readonly worker: Worker;
    private api: Comlink.Remote<TtsWorkerApi>;

    constructor() {
        this.worker = new Worker(new URL('./TtsWorker.ts', import.meta.url), { type: 'module' });

        // Add global error handler for the worker
        this.worker.addEventListener('error', (error) => {
            console.error('Worker error:', error);
        });

        this.api = Comlink.wrap<TtsWorkerApi>(this.worker);
    }

    private async withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
        let timeout: ReturnType<typeof setTimeout>;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeout = setTimeout(() => reject(new Error(message)), ms);
        });

        try {
            return await Promise.race([promise, timeoutPromise]);
        } finally {
            clearTimeout(timeout!);
        }
    }

    async load(id: TtsModelId): Promise<boolean> {
        const startTime = performance.now();

        await this.withTimeout(this.api.load(id), 90 * 1000, 'TTS loading timeout');

        const duration = performance.now() - startTime;
        console.log(`TTS loading took ${duration.toFixed(2)}ms`);
        return true;
    }

    async generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        const startTime = performance.now();

        const audio = await this.withTimeout(this.api.generate(text), 90 * 1000, 'TTS generation timeout');

        const duration = performance.now() - startTime;
        console.log(`TTS generation took ${duration.toFixed(2)}ms`);
        return audio;
    }
}
