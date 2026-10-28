import type { TtsAudioModel } from './ttsAudioModel';
import { pipeline } from '@huggingface/transformers';

export class XenovaAudioModel implements TtsAudioModel {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private synthesizer: any = null;

    async load(): Promise<void> {
        if (this.synthesizer) {
            console.log('Model already loaded');
            return;
        }

        this.synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', {dtype: 'fp16', device: 'webgpu'});
    }

    async generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        if (!this.synthesizer) {
            throw new Error('Synthesizer not loaded. Call load() first.');
        }

        try {
            console.log('Generating audio for:', text);

            const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';

            // Add timeout protection
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Speech synthesis timeout')), 90*1000);
            });

            const synthesisPromise = this.synthesizer(text, {speaker_embeddings});

            return await Promise.race([synthesisPromise, timeoutPromise]);
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            throw error;
        }
    }


}
