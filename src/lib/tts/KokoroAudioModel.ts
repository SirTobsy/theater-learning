import type { TtsAudioModel } from './ttsAudioModel';
import { KokoroTTS } from 'kokoro-js';

export class KokoroAudioModel implements TtsAudioModel {
    private synthesizer!: KokoroTTS;

    async load(): Promise<void> {
        if (this.synthesizer) {
            console.log('Model already loaded');
            return;
        }

        try {
            // 25.10.2025 WebGPU Testes in Brave Browser
            // fp32 works
            // fp16, q4f16 does not work (NaN Audio)
            // q8, q4 produces corrupt audio
            this.synthesizer = await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-ONNX", {
                    dtype: "fp32", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
                    device: "webgpu",
                });
        } catch (error) {
            // TODO on app this just fails and does not correctly set up a wasm model as fallback
            // WASM
            // fp32, fp16, q8, q4 works
            // q4f16 produces NaN Audio
            console.log("running model with 'webgpu' not possible. Fallback to 'wasm'")
            this.synthesizer = await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-ONNX", {
                    dtype: "q4",
                    device: "wasm",
                });
        }
        console.log("loaded model")
    }

    async generate(text: string): Promise<void> {
        if (!this.synthesizer) {
            throw new Error('Synthesizer not loaded. Call load() first.');
        }

        try {
            console.debug('Generating audio for:', text);

            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Speech synthesis timeout')), 10000);
            });

            const synthesisPromise = this.synthesizer.generate(text, {
                voice: "af_bella",
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return await Promise.race([synthesisPromise, timeoutPromise]) as any;
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            throw error;
        }
    }
}
