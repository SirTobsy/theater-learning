export interface TtsAudioModel {
    load(): Promise<void>;
    generate(text: string): Promise<{ audio: Float32Array; sampling_rate: number }>;
}
