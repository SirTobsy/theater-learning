import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import type { Character, ScriptLine, TTSSettings } from '#lib/services/tts/TtsService.js';

const { initialize } = vi.hoisted(() => ({ initialize: vi.fn() }));

vi.mock('#lib/services/tts/TtsService.js', () => ({
	ttsService: {
		initialize,
		processScript: vi.fn(),
		pause: vi.fn(),
		resume: vi.fn(),
		stop: vi.fn()
	}
}));
vi.mock('svelte-sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import ScriptDisplay from './ScriptDisplay.svelte';

const settings: TTSSettings = {
	model: 'kokoro',
	readOwnLines: false,
	beepOnOwnLines: true,
	pauseDuration: 1,
	volume: 0.8
};
const characters: Character[] = [
	{ id: 'john', name: 'John', voiceId: 'v1', isUserCharacter: false }
];
const script: ScriptLine[] = [{ id: 'l1', characterId: 'john', text: 'Hello.', type: 'dialogue' }];

describe('ScriptDisplay model changes', () => {
	beforeEach(() => {
		initialize.mockReset();
		initialize.mockResolvedValue(undefined);
	});

	it('initializes TTS with the current settings on mount', async () => {
		render(ScriptDisplay, { script, characters, settings });

		await waitFor(() => expect(screen.getByText('● TTS Ready')).toBeInTheDocument());
		expect(initialize).toHaveBeenCalledTimes(1);
		expect(initialize).toHaveBeenCalledWith(settings);
	});

	it('reinitializes TTS with the new model after the model changes', async () => {
		const { rerender } = render(ScriptDisplay, { script, characters, settings });
		await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));

		const next: TTSSettings = { ...settings, model: 'speech-t5' };
		await rerender({ script, characters, settings: next });

		await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));
		expect(initialize).toHaveBeenLastCalledWith(next);
	});

	it('shows the initializing state and disables playback while the new model loads', async () => {
		const { rerender } = render(ScriptDisplay, { script, characters, settings });
		await waitFor(() => expect(screen.getByText('● TTS Ready')).toBeInTheDocument());

		let finishLoading!: () => void;
		initialize.mockReturnValueOnce(new Promise<void>((resolve) => (finishLoading = resolve)));
		await rerender({ script, characters, settings: { ...settings, model: 'speech-t5' } });

		await waitFor(() => expect(screen.getByText('● Initializing...')).toBeInTheDocument());
		expect(screen.getByRole('button', { name: /read script/i })).toBeDisabled();

		finishLoading();
		await waitFor(() => expect(screen.getByText('● TTS Ready')).toBeInTheDocument());
		expect(screen.getByRole('button', { name: /read script/i })).toBeEnabled();
	});

	it('ignores a slow earlier load that finishes after a newer model was requested', async () => {
		let finishFirst!: () => void;
		let finishSecond!: () => void;
		initialize
			.mockReturnValueOnce(new Promise<void>((resolve) => (finishFirst = resolve)))
			.mockReturnValueOnce(new Promise<void>((resolve) => (finishSecond = resolve)));

		const { rerender } = render(ScriptDisplay, { script, characters, settings });
		await waitFor(() => expect(initialize).toHaveBeenCalledTimes(1));
		await rerender({ script, characters, settings: { ...settings, model: 'speech-t5' } });
		await waitFor(() => expect(initialize).toHaveBeenCalledTimes(2));

		finishFirst();
		await Promise.resolve();
		expect(screen.getByText('● Initializing...')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /read script/i })).toBeDisabled();

		finishSecond();
		await waitFor(() => expect(screen.getByText('● TTS Ready')).toBeInTheDocument());
	});
});
