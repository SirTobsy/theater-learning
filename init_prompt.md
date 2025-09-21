You are a cross-platform mobile app developer tasked with creating a comprehensive theater and movie script learning application. Build an app that helps actors and performers practice their scripts with advanced text-to-speech capabilities.

**Core Requirements:**

**Script Display View:**
- Create a clean, readable interface that displays scripts:
    - Different character names
    - Stage directions and screen information (italicized or bracketed)
    - Scene breaks and act divisions
    - Use the style of a movie script
- Add a prominent "Read" button that initiates text-to-speech playback. It does not read the character name


**Settings View:**
- Create two main TTS control switches:
    1. "Read Own Lines" toggle (On = read user's assigned lines, Off = Do not read and wait on the user Input "play")
    2. "Beep on Own Lines" toggle (plays audio cue when reaching user's lines)
- Include additional settings for playback speed, pause duration between lines, and volume controls

**Voice Configuration View:**
- Provide a character-to-voice mapping interface where users can:
    - Select a character from the script from a list
    - Assign different TTS voices to each character in the script
    - Preview voice selections with sample text
    - Save voice presets for reuse across different scripts

**Technical Implementation:**
- Use Transformer.js ('@huggingface/transformers') for local TTS processing
- Implement the Hugging Face TTS model that runs entirely on-device (no internet required)
- the used model should be `Xenova/speecht5_tts`
- Ensure cross-platform compatibility (iOS/Android/Web)
- Design for offline functionality

**User Experience Considerations:**
- Make the interface intuitive for theater performers of all technical skill levels
- Ensure text remains easily readable during playback with visual indicators showing current position
- Implement smooth transitions between different character voices
- Add progress indicators and playback controls (play/pause, skip)

**Deliverables:**
Provide a complete technical specification including architecture decisions, UI/UX mockups, implementation timeline, and testing strategy for this script learning application.