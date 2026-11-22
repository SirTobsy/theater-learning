import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel.svelte';
import type { TTSSettings } from '#lib/services/tts/TtsService.js';

const settings: TTSSettings = {
	model: 'kokoro',
	readOwnLines: false,
	beepOnOwnLines: true,
	pauseDuration: 2,
	volume: 0.8
};

describe('SettingsPanel volume', () => {
	it('displays the current volume as a percentage', () => {
		render(SettingsPanel, { settings: { ...settings, volume: 0.35 }, onSettingsChange: vi.fn() });

		expect(screen.getByText('Volume: 35%')).toBeInTheDocument();
	});

	it('reports a changed volume while keeping all other settings', async () => {
		const user = userEvent.setup();
		const onSettingsChange = vi.fn();
		render(SettingsPanel, { settings, onSettingsChange });

		const [, volumeThumb] = screen.getAllByRole('slider'); // pause duration, volume
		volumeThumb.focus();
		await user.keyboard('{ArrowLeft}');

		expect(onSettingsChange).toHaveBeenCalledTimes(1);
		const updated = onSettingsChange.mock.calls[0][0] as TTSSettings;
		expect(updated.volume).toBeCloseTo(0.75);
		expect({ ...updated, volume: settings.volume }).toEqual(settings);
	});
});

describe('SettingsPanel model selection', () => {
	it('shows the currently selected model', () => {
		render(SettingsPanel, { settings, onSettingsChange: vi.fn() });

		expect(screen.getByRole('combobox')).toHaveTextContent('Kokoro');
	});

	it('reports the newly chosen model while keeping all other settings', async () => {
		const user = userEvent.setup();
		const onSettingsChange = vi.fn();
		render(SettingsPanel, { settings, onSettingsChange });

		// bits-ui opens on pointerdown with a mouse pointerType, which jsdom doesn't
		// provide, so open the listbox via the keyboard. The floating wrapper stays
		// visibility:hidden (no layout in jsdom), so options can't be found by role.
		screen.getByRole('combobox').focus();
		await user.keyboard('{ArrowDown}');
		await user.click(await screen.findByText('SpeechT5'));

		expect(onSettingsChange).toHaveBeenCalledWith({ ...settings, model: 'speech-t5' });
	});

	it.each([['Practice Mode'], ['Full Read'], ['Learning Mode']])(
		'keeps the selected model when applying the %s preset',
		async (preset) => {
			const user = userEvent.setup();
			const onSettingsChange = vi.fn();
			render(SettingsPanel, {
				settings: { ...settings, model: 'speech-t5' },
				onSettingsChange
			});

			await user.click(screen.getByText(preset));

			expect(onSettingsChange).toHaveBeenCalledTimes(1);
			expect(onSettingsChange.mock.calls[0][0]).toMatchObject({ model: 'speech-t5' });
		}
	);
});
