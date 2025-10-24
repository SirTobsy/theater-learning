import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";
import {KokoroTTS} from "kokoro-js";

export class KokoroAudioModel implements TtsAudioModel {
    private synthesizer: KokoroTTS;

    async load(): Promise<void> {
        const model_id = "onnx-community/Kokoro-82M-ONNX";

        this.synthesizer = await KokoroTTS.from_pretrained(model_id, {
            dtype: "q4", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
        });
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

            return await Promise.race([synthesisPromise, timeoutPromise]) as any;
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            throw error;
        }
    }
}