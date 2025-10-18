import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";


export interface TtsAudioModel {
    isPlaying(): boolean;
    isPaused(): boolean;
    load(): Promise<void>;
    speak(text: string, settings: TTSSettings, voice?: Voice): Promise<void>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
    getVoices(): Promise<Voice[]>;
    getVoice(name: string): Promise<Voice>;
    getSupportedLanguages(): Promise<string[]>;
}
