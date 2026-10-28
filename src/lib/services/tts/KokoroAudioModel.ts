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
            // q4, q8, fp32 works
            // fp16, q4f16 does not work (NaN Audio)
            const dtype = "fp16"; // Options: "fp32", "fp16", "q8", "q4", "q4f16"
            this.synthesizer = await KokoroTTS.from_pretrained(
                "onnx-community/Kokoro-82M-ONNX", {
                    dtype,
                    device: "webgpu",
                });
            console.log(`loaded model onnx-community/Kokoro-82M-ONNX with dtype: ${dtype}, device: webgpu`)
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
            console.log("loaded model onnx-community/Kokoro-82M-ONNX with dtype: q4, device: wasm")
        }

    }

    private audioStats(audio: Float32Array) {
        let nan = 0;
        let peak = 0;
        for (const sample of audio) {
            if (Number.isNaN(sample)) nan++;
            else peak = Math.max(peak, Math.abs(sample));
        }
        return { samples: audio.length, nan, peak };
    }

    async generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }> {
        if (!this.synthesizer) {
            throw new Error('Synthesizer not loaded. Call load() first.');
        }

        const startTime = performance.now();
        let timeout: ReturnType<typeof setTimeout>;

        try {
            console.debug('Generating audio for:', text);

            // Add timeout protection
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeout = setTimeout(() => reject(new Error('Speech synthesis timeout')), 60000);
            });

            const synthesisPromise = this.synthesizer.generate(text, {
                voice: "af_bella",
            });

            const result = await Promise.race([synthesisPromise, timeoutPromise]);
            const audio = result.data; // RawAudio.audio may be chunked in transformers 4.x
            const stats = this.audioStats(audio);
            console.debug(`Generated audio in ${(performance.now() - startTime).toFixed(0)}ms`, stats);

            // q8 output overshoots +-1, which Web Audio hard-clips; scale it back into range
            if (stats.peak > 1) {
                for (let i = 0; i < audio.length; i++) {
                    audio[i] /= stats.peak;
                }
            }
            return { audio, sampling_rate: result.sampling_rate };
        } catch (error) {
            console.error(`Error during speech synthesis after ${(performance.now() - startTime).toFixed(0)}ms:`, error);
            throw error;
        } finally {
            clearTimeout(timeout!);
        }
    }
}
