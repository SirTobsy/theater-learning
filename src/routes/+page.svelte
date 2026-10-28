<script lang="ts">
	import Navigation, { type ViewType } from '$lib/components/Navigation.svelte';
	import ScriptDisplay from '$lib/components/ScriptDisplay.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import CharacterConfig from '$lib/components/CharacterConfig.svelte';
	import { sampleScript, sampleCharacters } from '$lib/data/sampleScript';
	import type { Character, ScriptLine, TTSSettings } from '$lib/services/tts/TtsService';

	let currentView = $state<ViewType>('script');
	let script = $state<ScriptLine[]>(sampleScript);
	let characters = $state<Character[]>(sampleCharacters);
	let settings = $state<TTSSettings>({
		readOwnLines: false,
		beepOnOwnLines: true,
		playbackSpeed: 1.0,
		pauseDuration: 2.0,
		volume: 0.8
	});
</script>

<div class="min-h-screen bg-gradient-bg">
	<header class="border-b border-border bg-card/50 backdrop-blur-sm">
		<div class="max-w-6xl mx-auto px-2 py-4">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-theatrical font-bold text-accent">Script Reader Pro</h1>
					<p class="text-sm text-muted-foreground">
						Professional theater script learning with TTS
					</p>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-6xl mx-auto px-4 py-6">
		<Navigation currentView={currentView} onViewChange={(v) => (currentView = v)} />

		{#if currentView === 'script'}
			<ScriptDisplay {script} {characters} {settings} />
		{:else if currentView === 'settings'}
			<SettingsPanel {settings} onSettingsChange={(s) => (settings = s)} />
		{:else if currentView === 'characters'}
			<CharacterConfig {characters} {script} onCharactersChange={(c) => (characters = c)} />
		{/if}
	</main>
</div>
