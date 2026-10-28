import * as Comlink from 'comlink';
import { KokoroAudioModel } from './KokoroAudioModel';
import type { TtsAudioModel } from './ttsAudioModel';

class TtsWorkerApi {
    private ttsModel: TtsAudioModel = new KokoroAudioModel();

    async load(): Promise<void> {
        await this.ttsModel.load();
    }

    async generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        return this.ttsModel.generate(text);
    }
}

Comlink.expose(new TtsWorkerApi());

export type { TtsWorkerApi };
