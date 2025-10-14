import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";
import {XenovaAudioModel} from "@/tts/XenovaAudioModel.ts";

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
    private ttsAudioModel: TtsAudioModel;
    private isInitialized = false;
    private audioContext: AudioContext | null = null;

    constructor(ttsAudioModel: TtsAudioModel) {
        this.ttsAudioModel = ttsAudioModel;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('load model')
            await this.ttsAudioModel.load();

            console.log('init beeps')
            // Initialize Audio Context for beeps
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            this.isInitialized = true;
            console.log('TTS Service initialized successfully');
        } catch (error) {
            console.error('Failed to initialize TTS Service:', error);
            throw new Error('TTS initialization failed');
        }
    }

    async speak(text: string, settings: TTSSettings): Promise<void> {
        if (!this.isInitialized) {
            throw new Error('TTS Service not initialized');
        }

        return new Promise((resolve, reject) => {
            // Stop any currently playing speech
            this.stop();

            // Set voice (use default for now)
            //const voices = this.ttsAudioModel.getVoices();

            // Start speaking
            this.ttsAudioModel.speak(text, settings);
        });
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

    stop(): void {
        if (this.ttsAudioModel.isPlaying()) {
            this.ttsAudioModel.stop();
        }
    }

    pause(): void {
        if (this.ttsAudioModel.isPlaying()) {
            this.ttsAudioModel.pause();
        }
    }

    resume(): void {
        if (this.ttsAudioModel.isPaused()) {
            this.ttsAudioModel.resume();
        }
    }

    async processScript(
        lines: ScriptLine[],
        characters: Character[],
        settings: TTSSettings,
        onLineStart?: (lineId: string) => void,
        onLineComplete?: (lineId: string) => void
    ): Promise<void> {
        console.log('processing script')

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

                if (!settings.readOwnLines) {
                    // Wait for user input or continue automatically after pause
                    await new Promise(resolve => {

                        //TODO change input to continue
                        // const handleKeyPress = (event: KeyboardEvent) => {
                        //     if (event.code === 'Space' || event.code === 'Enter') {
                        //         document.removeEventListener('keydown', handleKeyPress);
                        //         resolve(undefined);
                        //     }
                        // };
                        // document.addEventListener('keydown', handleKeyPress);

                        // Auto-continue after pause duration
                        setTimeout(() => {
                            //document.removeEventListener('keydown', handleKeyPress);
                            resolve(undefined);
                        }, settings.pauseDuration * 1000);
                    });
                } else {
                    // Read user's line
                    await this.speak(line.text, settings);
                }
            } else {
                // Read other character's line
                console.log('speak npc line')
                await this.speak(line.text, settings);
            }

            // Pause between lines
            await new Promise(resolve => setTimeout(resolve, settings.pauseDuration * 1000));

            // Notify line complete
            onLineComplete?.(line.id);
        }
    }
}

export const ttsService = new TtsService(new XenovaAudioModel());