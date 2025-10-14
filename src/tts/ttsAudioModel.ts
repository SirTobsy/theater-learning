import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";


export interface TtsAudioModel {
    isPlaying(): boolean;
    isPaused(): boolean;
    load(): Promise<void>;
    speak(text: string, settings: TTSSettings, voice?: Voice): Promise<void>;
    pause(): void;
    resume(): void;
    stop(): void;
    getVoices(): Voice[];
    getVoice(name: string): Voice;
    getSupportedLanguages(): string[];
}
