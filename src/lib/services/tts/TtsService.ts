import { TtsWorkerMessenger } from './TtsWorkerMessenger';
import { AudioPlayer } from './AudioPlayer';
import {DEFAULT_TTS_MODEL_ID, type TtsModelId} from "#lib/services/tts/models.ts";

export interface Model {
    id: string;
    name: string;
}

export interface TTSSettings {
    model: TtsModelId;
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

export class TtsService {
    private loadedModel: TtsModelId;
    private ttsWorkerMessenger: TtsWorkerMessenger;
    private audioPlayer: AudioPlayer;
    private playToken = 0;

    constructor(ttsWorker: TtsWorkerMessenger, audioPlayer: AudioPlayer, model: TtsModelId) {
        this.loadedModel = model;
        this.ttsWorkerMessenger = ttsWorker;
        this.audioPlayer = audioPlayer;
    }

    async initialize(ttsSettings: TTSSettings): Promise<void> {
        if (this.loadedModel == ttsSettings.model) return;

        try {
            console.log('load model')
            if (await this.ttsWorkerMessenger.load(ttsSettings.model)) {
                this.loadedModel = ttsSettings.model;
            }
            // else?
        } catch (error) {
            console.error('Failed to initialize TTS Service:', error);
            throw new Error('TTS initialization failed', { cause: error });
        }
    }

    async stop(): Promise<void> {
        this.playToken++;
        await this.audioPlayer.stop();
    }

    async pause(): Promise<void> {
        await this.audioPlayer.pause();
    }

    async resume(): Promise<void> {
        await this.audioPlayer.resume();
    }

    async processScript(
        lines: ScriptLine[],
        characters: Character[],
        settings: TTSSettings,
        onLineStart?: (lineId: string) => void,
        onLineComplete?: (lineId: string) => void
    ): Promise<void> {
        const token = ++this.playToken;
        for (const line of lines) {
            if (token !== this.playToken) break;
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
                    await this.readLine(line, settings, token);
                }
            } else {
                // Read another character's line
                await this.readLine(line, settings, token);
            }

            if (token !== this.playToken) break;

            // Notify line complete
            onLineComplete?.(line.id);
        }
    }

    async speak(text: string, settings: TTSSettings): Promise<void> {
        await this.readLine({ id: 'preview', characterId: '', text, type: 'dialogue' }, settings);
    }

    async readLine(line: ScriptLine, settings: TTSSettings, token?: number): Promise<void> {
        // Read line
        const out = await this.ttsWorkerMessenger.generate(line.text);
        await this.audioPlayer.playAudio(out.audio, out.sampling_rate);
        if (token !== undefined && token !== this.playToken) return;
        // waiting promise
        await new Promise(resolve => setTimeout(resolve, settings.pauseDuration * 1000));
    }
}

export const ttsService = new TtsService(new TtsWorkerMessenger(), new AudioPlayer(), DEFAULT_TTS_MODEL_ID);
