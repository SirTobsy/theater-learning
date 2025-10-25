import {KokoroAudioModel} from "@/tts/KokoroAudioModel.ts";
import {TtsAudioModel} from "@/tts/ttsAudioModel.ts";

const ttsModel: TtsAudioModel = new KokoroAudioModel()

self.addEventListener('message', async (event) => {
        const { type, text } = event.data;

        console.debug('received message from main thread: ', type, text)
        try {
            if (type === "load-model") {
                await ttsModel.load()
                self.postMessage({type: 'tts-ready'})
            } else if (type === "generate") {
                const audio = await ttsModel.generate(text)
                self.postMessage({type: 'audio', audio: audio, requestId: event.data.requestId})
            }
        } catch (error) {
            console.error('Error during speech synthesis:', error);
            self.postMessage({type: 'error', error: error.message, requestId: event.data.requestId})
            return
        }
    }
)