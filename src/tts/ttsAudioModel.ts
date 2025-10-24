export interface TtsAudioModel {
    load(): Promise<void>;
    generate(text: string): Promise<void>;
}
