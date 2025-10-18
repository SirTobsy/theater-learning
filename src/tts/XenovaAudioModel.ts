import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";
import {pipeline, TextToAudioPipeline} from "@huggingface/transformers";

export class XenovaAudioModel implements TtsAudioModel {
    private synthesizer= null; //TODO type
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private _isPlaying: boolean = false;
    private _isPaused: boolean = false;


    constructor(audioContext: AudioContext) {
        this.audioContext = audioContext;
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
        if (this.currentSource) {
            this.currentSource.start();
        }
        this._isPaused = false;
        this._isPlaying = true;
    }

    async stop(): Promise<void> {
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource.disconnect();
            this.currentSource = null;
        }
        this._isPlaying = false;
        this._isPaused = false;
    }

    async getSupportedLanguages(): Promise<string[]> {
        return [];
    }

    async speak(text: string, settings: TTSSettings): Promise<void> {
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

            // create wav file
            const speaker_embeddings = 'https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin';

            // Add timeout protection
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Speech synthesis timeout')), 2000);
            });

            const synthesisPromise = this.synthesizer(text, { speaker_embeddings });

            const out = await Promise.race([synthesisPromise, timeoutPromise]) as any;


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