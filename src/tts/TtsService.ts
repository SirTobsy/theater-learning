import {TtsWorkerMessenger} from "@/tts/TtsWorkerMessenger.ts";

export interface TTSSettings {
    readOwnLines: boolean;
    beepOnOwnLines: boolean;
    playbackSpeed: number;
    pauseDuration: number;
    volume: number;
}

export interface Character {
    id: string;
    name: string;
    voiceId: string;
    isUserCharacter: boolean;
}

export interface ScriptLine {
    id: string;
    characterId: string;
    text: string;
    type: 'dialogue' | 'stage-direction' | 'scene-break';
    isUserLine?: boolean;
}

class TtsService {
    private isInitialized = false;
    private audioContext: AudioContext | null = null;
    private currentSource: AudioBufferSourceNode | null = null;
    private ttsWorkerMessanger: TtsWorkerMessenger;

    constructor(ttsWorker: TtsWorkerMessenger) {
        this.ttsWorkerMessanger = ttsWorker;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('load model')
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.isInitialized = await this.ttsWorkerMessanger.load();
        } catch (error) {
            console.error('Failed to initialize TTS Service:', error);
            throw new Error('TTS initialization failed');
        }
    }

    async playBeep(): Promise<void> {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    async stop(): Promise<void> {
        // TODO
    }

    async pause(): Promise<void> {
        // TODO
    }

    async resume(): Promise<void> {
        // TODO
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

    async processScript(
        lines: ScriptLine[],
        characters: Character[],
        settings: TTSSettings,
        onLineStart?: (lineId: string) => void,
        onLineComplete?: (lineId: string) => void
    ): Promise<void> {
        for (const line of lines) {
            if (line.type !== 'dialogue') continue;

            console.log('process line: ',line.text)
            const character = characters.find(c => c.id === line.characterId);
            const isUserLine = character?.isUserCharacter || line.isUserLine;

            // Notify line start
            onLineStart?.(line.id);

            if (isUserLine) {
                if (settings.beepOnOwnLines) {
                    await this.playBeep();
                }

                if (settings.readOwnLines) {
                    // Read user's line
                    const out = await this.ttsWorkerMessanger.generate(line.text);
                    await this.playAudio(out.audio, out.sampling_rate);
                }
            } else {
                // Read another character's line
                console.log('speak npc line')
                const out = await this.ttsWorkerMessanger.generate(line.text);
                await this.playAudio(out.audio, out.sampling_rate);
            }

            // Pause between lines
            // await new Promise(resolve => setTimeout(resolve, settings.pauseDuration * 1000));

            // Notify line complete
            onLineComplete?.(line.id);
        }
    }
}

export const ttsService = new TtsService(new TtsWorkerMessenger());