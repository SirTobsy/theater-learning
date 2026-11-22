import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioPlayer } from './AudioPlayer';

function createAudioContextMock() {
	const gainNode = { connect: vi.fn(), gain: { value: 1 } };
	const source = {
		buffer: null as unknown,
		connect: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
		onended: null as null | (() => void)
	};
	const context = {
		state: 'running',
		destination: { name: 'destination' },
		createGain: vi.fn(() => gainNode),
		createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(4) })),
		createBufferSource: vi.fn(() => source)
	};
	return { context, gainNode, source };
}

describe('AudioPlayer volume', () => {
	let mocks: ReturnType<typeof createAudioContextMock>;

	beforeEach(() => {
		mocks = createAudioContextMock();
		vi.stubGlobal(
			'AudioContext',
			vi.fn(function () {
				return mocks.context;
			})
		);
		vi.spyOn(console, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
	});

	it('routes the gain node to the speakers', () => {
		new AudioPlayer();

		expect(mocks.gainNode.connect).toHaveBeenCalledWith(mocks.context.destination);
	});

	it('sets the gain value when the volume changes', () => {
		const player = new AudioPlayer();

		player.setVolume(0.35);
		expect(mocks.gainNode.gain.value).toBe(0.35);

		player.setVolume(0);
		expect(mocks.gainNode.gain.value).toBe(0);
	});

	it('plays audio through the gain node instead of directly to the destination', async () => {
		const player = new AudioPlayer();

		const playing = player.playAudio(new Float32Array(4), 16000);
		mocks.source.onended?.();
		await playing;

		expect(mocks.source.connect).toHaveBeenCalledWith(mocks.gainNode);
		expect(mocks.source.connect).not.toHaveBeenCalledWith(mocks.context.destination);
		expect(mocks.source.start).toHaveBeenCalled();
	});
});
