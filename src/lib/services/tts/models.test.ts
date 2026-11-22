import { describe, expect, it } from 'vitest';
import { DEFAULT_TTS_MODEL_ID, TTS_MODELS, isTtsModelId } from './models';

describe('TTS models', () => {
	it('accepts every registered model id', () => {
		for (const model of TTS_MODELS) expect(isTtsModelId(model.id)).toBe(true);
	});

	it('rejects unknown ids', () => {
		expect(isTtsModelId('')).toBe(false);
		expect(isTtsModelId('does-not-exist')).toBe(false);
	});

	it('uses a registered model as the default', () => {
		expect(isTtsModelId(DEFAULT_TTS_MODEL_ID)).toBe(true);
	});
});
