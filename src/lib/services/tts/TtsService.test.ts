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
		stop: vi.fn().mockResolvedValue(undefined),
		pause: vi.fn().mockResolvedValue(undefined),
		beep: vi.fn().mockResolvedValue(undefined)
	} as unknown as AudioPlayer;
}

const settings: TTSSettings = {
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
