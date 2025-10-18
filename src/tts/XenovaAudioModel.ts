import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";
import {pipeline, TextToAudioPipeline} from "@huggingface/transformers";

export class XenovaAudioModel implements TtsAudioModel {
    private synthesizer= null; //TODO type

    async getVoice(name: string): Promise<Voice> {
        return undefined;
    }

    async getVoices(): Promise<Voice[]> {
        return [];
    }

    isPaused(): boolean {
        return false;
    }

    isPlaying(): boolean {
        return false;
    }

    async load(): Promise<void> {
        if (this.synthesizer) {
            console.log('Model already loaded');
            return;
        }

        this.synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { dtype: 'q8' });

        console.log('successfully loaded')
        return Promise.resolve(undefined);
    }

    async pause(): Promise<void> {
    }

    async resume(): Promise<void> {
    }

    async stop(): Promise<void> {
    }

    async getSupportedLanguages(): Promise<string[]> {
        return [];
    }

    async speak(text: string, settings: TTSSettings): Promise<void> {
        if (!this.synthesizer) {
            throw new Error('Synthesizer not loaded. Call load() first.');
        }

        try {
            console.log('Generating audio for:', text);

            // create wav file
            const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
            const out = await this.synthesizer(text, { speaker_embeddings });
            console.log(out);

            console.log('Started speaking');
            // play wav file
            await this.playAudio(out.audio, out.sampling_rate);
            console.log('done speaking');
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            throw error;
        }
    }

    async playAudio(audioData: Float32Array, samplingRate: number): Promise<void> {
        return new Promise((resolve) => {
            // 1. Create an AudioContext
            const audioContext = new window.AudioContext();

            // 2. Create an AudioBuffer
            const audioBuffer = audioContext.createBuffer(
                1, // number of channels (1 for mono)
                audioData.length, // buffer length
                samplingRate // sampling rate
            );

            // 3. Copy your audio data into the AudioBuffer
            audioBuffer.getChannelData(0).set(audioData);

            // 4. Create a source node
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffer;

            // 5. Connect the source to the destination (speakers) and play
            source.connect(audioContext.destination);

            // 6. Resolve the promise when the audio is finished playing
            source.onended = () => {
                resolve();
            }

            source.start();
        })
    }

}