export const TTS_MODELS = [
    { id: 'kokoro', name: 'Kokoro', description: '...'},
    { id: 'speech-t5', name: 'SpeechT5', description: '...'}
] as const;

export type TtsModelId = (typeof TTS_MODELS)[number]['id'];
export const DEFAULT_TTS_MODEL_ID: TtsModelId = 'kokoro';

export function isTtsModelId(value: string): value is TtsModelId {
    return TTS_MODELS.some((model) => model.id === value);
}
