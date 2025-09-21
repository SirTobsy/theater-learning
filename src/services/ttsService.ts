import { pipeline } from '@huggingface/transformers';

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

class TTSService {
    private speechSynthesis: SpeechSynthesis;
    private isInitialized = false;
    private currentUtterance: SpeechSynthesisUtterance | null = null;
    private audioContext: AudioContext | null = null;

    constructor() {
        this.speechSynthesis = window.speechSynthesis;
    }

    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Initialize Audio Context for beeps
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Wait for voices to load
            if (this.speechSynthesis.getVoices().length === 0) {
                await new Promise<void>((resolve) => {
                    this.speechSynthesis.addEventListener('voiceschanged', () => resolve(), { once: true });
                });
            }

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

            // Create new utterance
            this.currentUtterance = new SpeechSynthesisUtterance(text);

            // Apply settings
            this.currentUtterance.rate = settings.playbackSpeed;
            this.currentUtterance.volume = settings.volume;

            // Set voice (use default for now)
            const voices = this.speechSynthesis.getVoices();
            if (voices.length > 0) {
                this.currentUtterance.voice = voices[0];
            }

            // Set up event listeners
            this.currentUtterance.onend = () => {
                this.currentUtterance = null;
                resolve();
            };

            this.currentUtterance.onerror = (event) => {
                this.currentUtterance = null;
                reject(new Error(`Speech synthesis error: ${event.error}`));
            };

            // Start speaking
            this.speechSynthesis.speak(this.currentUtterance);
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
        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
            this.currentUtterance = null;
        }
    }

    pause(): void {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.pause();
        }
    }

    resume(): void {
        if (this.speechSynthesis.paused) {
            this.speechSynthesis.resume();
        }
    }

    isPlaying(): boolean {
        return this.speechSynthesis.speaking;
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
                        const handleKeyPress = (event: KeyboardEvent) => {
                            if (event.code === 'Space' || event.code === 'Enter') {
                                document.removeEventListener('keydown', handleKeyPress);
                                resolve(undefined);
                            }
                        };
                        document.addEventListener('keydown', handleKeyPress);

                        // Auto-continue after pause duration
                        setTimeout(() => {
                            document.removeEventListener('keydown', handleKeyPress);
                            resolve(undefined);
                        }, settings.pauseDuration * 1000);
                    });
                } else {
                    // Read user's line
                    await this.speak(line.text, settings);
                }
            } else {
                // Read other character's line
                await this.speak(line.text, settings);
            }

            // Pause between lines
            await new Promise(resolve => setTimeout(resolve, settings.pauseDuration * 1000));

            // Notify line complete
            onLineComplete?.(line.id);
        }
    }
}

export const ttsService = new TTSService();