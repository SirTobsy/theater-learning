import * as Comlink from 'comlink';
import type { TtsAudioModel } from './ttsAudioModel';
import type {TtsModelId} from "#lib/services/tts/models.ts";

const factories = {
    'kokoro': async () => new (await import('./KokoroAudioModel')).KokoroAudioModel(),
    'speech-t5': async () => new (await import('./XenovaAudioModel')).XenovaAudioModel(),
} satisfies Record<TtsModelId, () => Promise<TtsAudioModel>>;

class TtsWorkerApi {
    private model?: TtsAudioModel;

    async load(id: TtsModelId): Promise<void> {
        this.model = await factories[id]();
        await this.model.load()
    }

    async generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        return this.model!.generate(text);
    }
}

Comlink.expose(new TtsWorkerApi());

export type { TtsWorkerApi };
