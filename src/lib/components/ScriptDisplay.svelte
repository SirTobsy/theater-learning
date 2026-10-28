<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import PlayIcon from '@lucide/svelte/icons/play';
	import PauseIcon from '@lucide/svelte/icons/pause';
	import SquareIcon from '@lucide/svelte/icons/square';
	import { ttsService, type Character, type ScriptLine, type TTSSettings } from '#lib/services/tts/TtsService.js';
	import { toast } from 'svelte-sonner';

	let {
		script,
		characters,
		settings
	}: { script: ScriptLine[]; characters: Character[]; settings: TTSSettings } = $props();

	let isPlaying = $state(false);
	let isPaused = $state(false);
	let currentLineId = $state<string | null>(null);
	let isInitialized = $state(false);

	$effect(() => {
		initializeTTS();
	});

	async function initializeTTS() {
		try {
			await ttsService.initialize();
			isInitialized = true;
			toast.success('TTS Ready', {
				description: 'Text-to-speech service initialized successfully'
			});
		} catch (error) {
			toast.error('TTS Error', {
				description: 'Failed to initialize text-to-speech'
			});
		}
	}

	async function handlePlay(): Promise<void> {
		if (!isInitialized) {
			toast.error('Not Ready', {
				description: 'Please wait for TTS to initialize'
			});
			return;
		}

		console.log('Start Playing script');
		try {
			isPlaying = true;
			isPaused = false;
			await ttsService.processScript(
				script,
				characters,
				settings,
				(lineId) => (currentLineId = lineId),
				() => {
					currentLineId = null;
				}
			);
		} catch (error) {
			console.error('Error playing script:', error);
			toast.error('Playback Error', {
				description: 'Failed to play script'
			});
		} finally {
			isPlaying = false;
			isPaused = false;
			currentLineId = null;
		}
	}

	function handlePause() {
		ttsService.pause();
		isPaused = true;
	}

	function handleResume() {
		ttsService.resume();
		isPaused = false;
	}

	function handleStop() {
		ttsService.stop();
		isPlaying = false;
		isPaused = false;
		currentLineId = null;
	}

	function getCharacterName(characterId: string): string {
		const character = characters.find((c) => c.id === characterId);
		return character?.name || 'Unknown';
	}

	function isUserLine(line: ScriptLine): boolean {
		const character = characters.find((c) => c.id === line.characterId);
		return character?.isUserCharacter || line.isUserLine || false;
	}
</script>

<div class="w-full max-w-4xl mx-auto p-2">
	<!-- Controls -->
	<Card class="mb-6 p-4 bg-card border-border">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				{#if !isPlaying}
					<Button
						onclick={handlePlay}
						disabled={!isInitialized}
						variant="default"
						class="bg-gradient-primary hover:opacity-90"
					>
						<PlayIcon class="w-4 h-4 mr-2" />
						Read Script
					</Button>
				{:else}
					<div class="flex space-x-2">
						{#if isPaused}
							<Button onclick={handleResume} variant="secondary">
								<PlayIcon class="w-4 h-4 mr-2" />
								Resume
							</Button>
						{:else}
							<Button onclick={handlePause} variant="secondary">
								<PauseIcon class="w-4 h-4 mr-2" />
								Pause
							</Button>
						{/if}
						<Button onclick={handleStop} variant="outline">
							<SquareIcon class="w-4 h-4 mr-2" />
							Stop
						</Button>
					</div>
				{/if}
			</div>

			<div class="flex items-center space-x-2 text-sm text-muted-foreground">
				{#if isInitialized}
					<span class="text-success">● TTS Ready</span>
				{:else}
					<span class="text-warning">● Initializing...</span>
				{/if}
			</div>
		</div>
	</Card>

	<!-- Script Content -->
	<Card class="script-container min-h-[600px]">
		<div class="space-y-2">
			{#each script as line (line.id)}
				{#if line.type === 'scene-break'}
					<div class="my-8">
						<hr class="border-border" />
						<div class="text-center py-4">
							<span class="script-text text-accent font-medium">
								{line.text}
							</span>
						</div>
						<hr class="border-border" />
					</div>
				{:else if line.type === 'stage-direction'}
					<div class="my-4">
						<div class={`stage-direction ${currentLineId === line.id ? 'current-line' : ''}`}>
							[{line.text}]
						</div>
					</div>
				{:else}
					<div
						class={`mb-6 ${isUserLine(line) ? 'user-line' : ''} ${
							currentLineId === line.id ? 'current-line' : ''
						} rounded-lg p-4 transition-all duration-300`}
					>
						<div class="character-name mb-2">
							{getCharacterName(line.characterId)}
							{#if isUserLine(line)}
								<span class="ml-2 text-xs bg-accent text-accent-foreground px-2 py-1 rounded"
									>YOU</span
								>
							{/if}
						</div>
						<div class="script-text pl-4">
							{line.text}
						</div>
					</div>
				{/if}
			{/each}
		</div>

		{#if script.length === 0}
			<div class="text-center py-12 text-muted-foreground">
				<p class="text-lg">No script loaded</p>
				<p class="text-sm mt-2">Upload or paste a script to get started</p>
			</div>
		{/if}
	</Card>
</div>
