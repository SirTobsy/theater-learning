export class AudioPlayer {
    private audioContext: AudioContext;
    private currentSource: AudioBufferSourceNode | null = null;

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    async playAudio(audioData: Float32Array, samplingRate: number): Promise<void> {
        return new Promise((resolve, reject) => {
            // TODO wait for audio to finish playing?

            try {
                // 2. Create an AudioBuffer
                const audioBuffer = this.audioContext.createBuffer(
                    1, // number of channels (1 for mono)
                    audioData.length, // buffer length
                    samplingRate // sampling rate
                );

                // 3. Copy your audio data into the AudioBuffer
                audioBuffer.getChannelData(0).set(audioData);

                // 4. Create a source node
                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                this.currentSource = source;

                // 5. Connect the source to the destination (speakers) and play
                source.connect(this.audioContext.destination);

                // 6. Resolve the promise when the audio is finished playing
                source.onended = () => {
                    console.log('Audio finished playing');
                    this.currentSource = null;
                    resolve();
                }

                source.start();
            } catch (error) {
                this.stop()
                reject(error);
            }
        })
    }

    async stop(): Promise<void> {
        // play -> stop
        // paused -> stop
        if (this.currentSource) {
            this.currentSource.stop();
            this.currentSource = null;
        }
    }

    async pause(): Promise<void> {
        // play -> pause
        // stopped -> pause (does not make sense)
        // TODO how?
    }

    async beep(): Promise<void> {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }
}
