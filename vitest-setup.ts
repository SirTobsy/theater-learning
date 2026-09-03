import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement Worker or the Web Audio API. TtsService.ts eagerly
// constructs a TtsWorkerMessenger + AudioPlayer at module load time, so these
// stubs just need to exist to avoid crashing on import in tests.
if (typeof globalThis.Worker === 'undefined') {
	class WorkerStub {
		constructor(_url: string | URL, _options?: WorkerOptions) {}
		postMessage() {}
		addEventListener() {}
		removeEventListener() {}
		terminate() {}
	}
	// @ts-expect-error test-only stub
	globalThis.Worker = WorkerStub;
}

if (typeof globalThis.AudioContext === 'undefined') {
	class AudioContextStub {
		createBuffer() {
			return { getChannelData: () => new Float32Array() };
		}
		createBufferSource() {
			return { connect() {}, start() {}, stop() {} };
		}
		createOscillator() {
			return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {} } };
		}
		createGain() {
			return {
				connect() {},
				gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }
			};
		}
		get currentTime() {
			return 0;
		}
		get destination() {
			return {};
		}
	}
	// @ts-expect-error test-only stub
	globalThis.AudioContext = AudioContextStub;
}
