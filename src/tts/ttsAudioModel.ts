import {Voice} from "@/tts/Voice.ts";
import {TTSSettings} from "@/tts/TtsService.ts";


export interface TtsAudioModel {
    load(): Promise<void>;
    generate(text: string): Promise<void>;
}
