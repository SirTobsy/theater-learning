import {TtsWorkerMessenger} from "@/tts/TtsWorkerMessenger.ts";
import {AudioPlayer} from "@/tts/AudioPlayer.ts";

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
    private ttsWorkerMessanger: TtsWorkerMessenger;
    private audioPlayer: AudioPlayer;

    constructor(ttsWorker: TtsWorkerMessenger, audioPlayer: AudioPlayer) {
        this.ttsWorkerMessanger = ttsWorker;
        this.audioPlayer = audioPlayer;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('load model')
            this.isInitialized = await this.ttsWorkerMessanger.load();
        } catch (error) {
            console.error('Failed to initialize TTS Service:', error);
            throw new Error('TTS initialization failed');
        }
    }

    async stop(): Promise<void> {
        await this.audioPlayer.stop();
    }

    async pause(): Promise<void> {
        await this.audioPlayer.pause();
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
                    await this.audioPlayer.beep();
                }

                if (settings.readOwnLines) {
                    // Read user's line
                    await this.readLine(line, settings);
                }
            } else {
                // Read another character's line
                await this.readLine(line, settings);
            }

            // Notify line complete
            onLineComplete?.(line.id);
        }
    }

    async readLine(line: ScriptLine, settings: TTSSettings): Promise<void> {
        // Read line
        const out = await this.ttsWorkerMessanger.generate(line.text);
        await this.audioPlayer.playAudio(out.audio, out.sampling_rate);
        // waiting promise
        await new Promise(resolve => setTimeout(resolve, settings.pauseDuration * 1000));
    }
}

export const ttsService = new TtsService(new TtsWorkerMessenger(), new AudioPlayer());