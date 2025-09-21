import { ScriptLine } from '@/services/ttsService';

export const sampleScript: ScriptLine[] = [
    {
        id: 'line-1',
        type: 'scene-break',
        characterId: '',
        text: 'ACT I - SCENE 1'
    },
    {
        id: 'line-2',
        type: 'stage-direction',
        characterId: '',
        text: 'The curtain rises on a modest living room. JOHN sits reading a newspaper while MARY paces nervously by the window.'
    },
    {
        id: 'line-3',
        type: 'dialogue',
        characterId: 'mary',
        text: "John, we need to talk about what happened yesterday."
    },
    {
        id: 'line-4',
        type: 'dialogue',
        characterId: 'john',
        text: "Not now, Mary. I'm trying to read the news."
    },
    {
        id: 'line-5',
        type: 'dialogue',
        characterId: 'mary',
        text: "This can't wait! The neighbors are asking questions, and I don't know what to tell them."
    },
    {
        id: 'line-6',
        type: 'stage-direction',
        characterId: '',
        text: 'JOHN lowers his newspaper and looks at MARY with concern.'
    },
    {
        id: 'line-7',
        type: 'dialogue',
        characterId: 'john',
        text: "What kind of questions? What did you tell them?"
    },
    {
        id: 'line-8',
        type: 'dialogue',
        characterId: 'mary',
        text: "I told them we were renovating the basement, but Mrs. Henderson says she heard strange noises at three in the morning."
    },
    {
        id: 'line-9',
        type: 'dialogue',
        characterId: 'john',
        text: "Strange noises? That woman needs to mind her own business."
    },
    {
        id: 'line-10',
        type: 'dialogue',
        characterId: 'mary',
        text: "John, please! This is serious. What if she calls the police?"
    },
    {
        id: 'line-11',
        type: 'stage-direction',
        characterId: '',
        text: 'JOHN stands up abruptly, folding his newspaper with sharp precision.'
    },
    {
        id: 'line-12',
        type: 'dialogue',
        characterId: 'john',
        text: "Let her call them. We have nothing to hide. We were simply... reorganizing storage areas."
    },
    {
        id: 'line-13',
        type: 'dialogue',
        characterId: 'mary',
        text: "But what about the—"
    },
    {
        id: 'line-14',
        type: 'dialogue',
        characterId: 'john',
        text: "Mary! Enough. We stick to our story. Renovation work. End of discussion."
    },
    {
        id: 'line-15',
        type: 'stage-direction',
        characterId: '',
        text: 'A loud knock at the door. Both freeze.'
    },
    {
        id: 'line-16',
        type: 'dialogue',
        characterId: 'mary',
        text: "Oh no... what if that's—"
    },
    {
        id: 'line-17',
        type: 'dialogue',
        characterId: 'john',
        text: "Calm down. Answer the door like nothing's wrong. Remember, we're just a normal couple doing home improvements."
    },
    {
        id: 'line-18',
        type: 'stage-direction',
        characterId: '',
        text: 'MARY walks slowly toward the door as the knocking continues, more insistent now.'
    }
];

export const sampleCharacters = [
    {
        id: 'mary',
        name: 'Mary Thompson',
        voiceId: 'voice-2',
        isUserCharacter: false
    },
    {
        id: 'john',
        name: 'John Thompson',
        voiceId: 'voice-1',
        isUserCharacter: false
    }
];