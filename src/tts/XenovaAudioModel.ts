import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";
import {pipeline, TextToAudioPipeline} from "@huggingface/transformers";

export class XenovaAudioModel implements TtsAudioModel {
    private synthesizer= null; //TODO type

    getVoice(name: string): Voice {
        return undefined;
    }

    getVoices(): Voice[] {
        return [];
    }

    isPaused(): boolean {
        return false;
    }

    isPlaying(): boolean {
        return false;
    }

    async load(): Promise<void> {
        this.synthesizer = await pipeline('text-to-speech', 'Xenova/speecht5_tts', { dtype: 'q8' });

        console.log('successfully loaded')
        return Promise.resolve(undefined);
    }

    pause(): void {
    }

    resume(): void {
    }

    async speak(text: string, settings: TTSSettings): Promise<void> {
        // create wav file
        const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';
        const out = await this.synthesizer(text, { speaker_embeddings })
        console.log(out)

        // play wav file
        this.playAudio(out.audio, out.sampling_rate)
    }

    playAudio(audioData: Float32Array, samplingRate: number) {
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
        source.start();
    }

    stop(): void {
    }

    getSupportedLanguages(): string[] {
        return [];
    }

}