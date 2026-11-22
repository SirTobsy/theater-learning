import { describe, expect, it, vi } from 'vitest';
import { TtsService, type Character, type ScriptLine, type TTSSettings } from './TtsService';
import type { TtsWorkerMessenger } from './TtsWorkerMessenger';
import type { AudioPlayer } from './AudioPlayer';

function createMessenger(): TtsWorkerMessenger {
	return {
		load: vi.fn().mockResolvedValue(true),
		generate: vi.fn().mockResolvedValue({ audio: new Float32Array(), sampling_rate: 16000 })
	} as unknown as TtsWorkerMessenger;
}

function createAudioPlayer(): AudioPlayer {
	return {
		playAudio: vi.fn().mockResolvedValue(undefined),
		setVolume: vi.fn(),
		stop: vi.fn().mockResolvedValue(undefined),
		pause: vi.fn().mockResolvedValue(undefined),
		beep: vi.fn().mockResolvedValue(undefined)
	} as unknown as AudioPlayer;
}

const settings: TTSSettings = {
	model: 'kokoro',
	readOwnLines: false,
	beepOnOwnLines: true,
	pauseDuration: 0,
	volume: 1
};

const characters: Character[] = [
	{ id: 'john', name: 'John', voiceId: 'voice-1', isUserCharacter: false },
	{ id: 'mary', name: 'Mary', voiceId: 'voice-2', isUserCharacter: true }
];

const script: ScriptLine[] = [
	{ id: 'l1', characterId: '', text: 'ACT I', type: 'scene-break' },
	{ id: 'l2', characterId: 'john', text: 'Hello.', type: 'dialogue' },
	{ id: 'l3', characterId: 'mary', text: 'Hi there.', type: 'dialogue' }
];

describe('TtsService.processScript', () => {
	it('reads every dialogue line and beeps (but does not read) the user character line', async () => {
		const messenger = createMessenger();
		const audioPlayer = createAudioPlayer();
		const service = new TtsService(messenger, audioPlayer);

		const started: string[] = [];
		const completed: string[] = [];

		await service.processScript(
			script,
			characters,
			settings,
			(id) => started.push(id),
			(id) => completed.push(id)
		);

		expect(started).toEqual(['l2', 'l3']);
		expect(completed).toEqual(['l2', 'l3']);

		// non-user line: read via TTS
		expect(messenger.generate).toHaveBeenCalledWith('Hello.');
		// user line: beeped, not read (readOwnLines is false)
		expect(audioPlayer.beep).toHaveBeenCalledTimes(1);
		expect(messenger.generate).not.toHaveBeenCalledWith('Hi there.');
	});
});

describe('TtsService.initialize', () => {
	it('loads the model selected in the settings', async () => {
		const messenger = createMessenger();
		const service = new TtsService(messenger, createAudioPlayer());

		await service.initialize({ ...settings, model: 'speech-t5' });

		expect(messenger.load).toHaveBeenCalledTimes(1);
		expect(messenger.load).toHaveBeenCalledWith('speech-t5');
	});

	it('does not reload when the model is unchanged', async () => {
		const messenger = createMessenger();
		const service = new TtsService(messenger, createAudioPlayer());

		await service.initialize(settings);
		await service.initialize({ ...settings, volume: 0.3 });

		expect(messenger.load).toHaveBeenCalledTimes(1);
	});

	it('reloads when the model changes', async () => {
		const messenger = createMessenger();
		const service = new TtsService(messenger, createAudioPlayer());

		await service.initialize({ ...settings, model: 'kokoro' });
		await service.initialize({ ...settings, model: 'speech-t5' });

		expect(messenger.load).toHaveBeenCalledTimes(2);
		expect(messenger.load).toHaveBeenNthCalledWith(1, 'kokoro');
		expect(messenger.load).toHaveBeenNthCalledWith(2, 'speech-t5');
	});

	it('throws and retries on the next call when loading fails', async () => {
		const messenger = createMessenger();
		const cause = new Error('boom');
		vi.mocked(messenger.load).mockRejectedValueOnce(cause);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		const service = new TtsService(messenger, createAudioPlayer());

		await expect(service.initialize(settings)).rejects.toMatchObject({
			message: 'TTS initialization failed',
			cause
		});

		await service.initialize(settings);
		expect(messenger.load).toHaveBeenCalledTimes(2);
	});

	it('retries loading when the worker reports the model as not loaded', async () => {
		const messenger = createMessenger();
		vi.mocked(messenger.load).mockResolvedValueOnce(false);
		const service = new TtsService(messenger, createAudioPlayer());

		await service.initialize(settings);
		await service.initialize(settings);

		expect(messenger.load).toHaveBeenCalledTimes(2);
	});
});

describe('TtsService volume', () => {
	const lines: ScriptLine[] = [{ id: 'l2', characterId: 'john', text: 'Hello.', type: 'dialogue' }];

	it('applies the volume setting to the audio player before playing a line', async () => {
		const audioPlayer = createAudioPlayer();
		const service = new TtsService(createMessenger(), audioPlayer);

		await service.processScript(lines, characters, { ...settings, volume: 0.4 }, vi.fn(), vi.fn());

		expect(audioPlayer.setVolume).toHaveBeenCalledWith(0.4);
		const setVolumeOrder = vi.mocked(audioPlayer.setVolume).mock.invocationCallOrder[0];
		const playOrder = vi.mocked(audioPlayer.playAudio).mock.invocationCallOrder[0];
		expect(setVolumeOrder).toBeLessThan(playOrder);
	});

	it('picks up a changed volume on the next run', async () => {
		const audioPlayer = createAudioPlayer();
		const service = new TtsService(createMessenger(), audioPlayer);

		await service.processScript(lines, characters, { ...settings, volume: 0.2 }, vi.fn(), vi.fn());
		await service.processScript(lines, characters, { ...settings, volume: 0.9 }, vi.fn(), vi.fn());

		expect(vi.mocked(audioPlayer.setVolume).mock.calls).toEqual([[0.2], [0.9]]);
	});
});
