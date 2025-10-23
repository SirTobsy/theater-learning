import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";
import {KokoroTTS} from "kokoro-js";

export class KokoroAudioModel implements TtsAudioModel {
    private synthesizer: KokoroTTS;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private _isPlaying: boolean = false;
    private _isPaused: boolean = false;

    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
    }

    getSupportedLanguages(): Promise<string[]> {
        return Promise.resolve([]);
    }

    async getVoice(name: string): Promise<Voice> {
        return undefined;
    }

    async getVoices(): Promise<Voice[]> {
        return [];
    }

    isPaused(): boolean {
        return this._isPaused;
    }

    isPlaying(): boolean {
        return this._isPlaying;
    }

    async load(): Promise<void> {
        const model_id = "onnx-community/Kokoro-82M-ONNX";

        this.synthesizer = await KokoroTTS.from_pretrained(model_id, {
            dtype: "q4", // Options: "fp32", "fp16", "q8", "q4", "q4f16"
        });
    }

    pause(): Promise<void> {
        return Promise.resolve(undefined);
    }

    resume(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async speak(text: string, settings: TTSSettings, voice?: Voice): Promise<void> {
        if (!this.synthesizer) {
            throw new Error('Synthesizer not loaded. Call load() first.');
        }

        if (this._isPlaying) {
            console.warn('Already playing, stopping current playback');
            await this.stop();
        }

        try {
            this._isPlaying = true;
            console.log('Generating audio for:', text);

            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Speech synthesis timeout')), 10000);
            });

            const synthesisPromise = this.synthesizer.generate(text, {
                voice: "af_bella",
            });

            const out = await Promise.race([synthesisPromise, timeoutPromise]) as any;
            console.log(typeof(out))

            console.log('Started speaking');
            // play wav file
            await this.playAudio(out.audio, out.sampling_rate);
            console.log('done speaking');
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            throw error;
        } finally {
            this._isPlaying = false;
        }


    }

    stop(): Promise<void> {
        return Promise.resolve(undefined);
    }

    async playAudio(audioData: Float32Array, samplingRate: number): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                // 2. Create an AudioBuffer
                const audioBuffer = this.audioContext.createBuffer(
                    1, // number of channels (1 for mono)
                    audioData.length, // buffer length
                    samplingRate // sampling rate
                );

                // 3. Copy your audio data into the AudioBuffer
                audioBuffer.getChannelData(0).set(audioData);

                // 4. Create a source node
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                this.currentSource = source;

                // 5. Connect the source to the destination (speakers) and play
                source.connect(this.audioContext.destination);

                // 6. Resolve the promise when the audio is finished playing
                source.onended = () => {
                    console.log('Audio finished playing');
                    this._isPlaying = false;
                    this.currentSource = null;
                    resolve();
                }

                source.start();
            } catch (error) {
                this.currentSource = null;
                this.stop()
                reject(error);
            }
        })
    }

}