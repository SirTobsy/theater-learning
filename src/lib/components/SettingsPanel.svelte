<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import type { TTSSettings } from '#lib/services/tts/TtsService.js';

	let {
		settings,
		onSettingsChange
	}: { settings: TTSSettings; onSettingsChange: (settings: TTSSettings) => void } = $props();

	function updateSetting<K extends keyof TTSSettings>(key: K, value: TTSSettings[K]) {
		onSettingsChange({
			...settings,
			[key]: value
		});
	}
</script>

<div class="w-full max-w-2xl mx-auto p-6">
	<Card class="bg-card border-border">
		<CardHeader>
			<CardTitle class="font-theatrical text-2xl text-accent">Playback Settings</CardTitle>
			<CardDescription>Customize your script reading experience</CardDescription>
		</CardHeader>

		<CardContent class="space-y-8">
			<!-- Main TTS Controls -->
			<div class="space-y-6">
				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<Label class="text-base font-medium">Read Own Lines</Label>
						<p class="text-sm text-muted-foreground">
							Have the TTS read your assigned character lines aloud
						</p>
					</div>
					<Switch
						checked={settings.readOwnLines}
						onCheckedChange={(checked: boolean) => updateSetting('readOwnLines', checked)}
					/>
				</div>

				<div class="flex items-center justify-between">
					<div class="space-y-1">
						<Label class="text-base font-medium">Beep on Own Lines</Label>
						<p class="text-sm text-muted-foreground">
							Play an audio cue when reaching your lines
						</p>
					</div>
					<Switch
						checked={settings.beepOnOwnLines}
						onCheckedChange={(checked: boolean) => updateSetting('beepOnOwnLines', checked)}
					/>
				</div>
			</div>

			<!-- Playback Controls -->
			<div class="space-y-6">
				<div class="space-y-3">
					<Label class="text-base font-medium">
						Playback Speed: {settings.playbackSpeed.toFixed(1)}x
					</Label>
					<Slider
						value={settings.playbackSpeed}
						onValueChange={(value: number) => updateSetting('playbackSpeed', value)}
						min={0.5}
						max={2.0}
						step={0.1}
						class="w-full"
					/>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>0.5x (Slow)</span>
						<span>1.0x (Normal)</span>
						<span>2.0x (Fast)</span>
					</div>
				</div>

				<div class="space-y-3">
					<Label class="text-base font-medium">
						Pause Duration: {settings.pauseDuration.toFixed(1)}s
					</Label>
					<Slider
						value={settings.pauseDuration}
						onValueChange={(value: number) => updateSetting('pauseDuration', value)}
						min={0.5}
						max={5.0}
						step={0.1}
						class="w-full"
					/>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>0.5s</span>
						<span>2.5s</span>
						<span>5.0s</span>
					</div>
				</div>

				<div class="space-y-3">
					<Label class="text-base font-medium">
						Volume: {Math.round(settings.volume * 100)}%
					</Label>
					<Slider
						value={settings.volume}
						onValueChange={(value: number) => updateSetting('volume', value)}
						min={0.0}
						max={1.0}
						step={0.05}
						class="w-full"
					/>
					<div class="flex justify-between text-xs text-muted-foreground">
						<span>0%</span>
						<span>50%</span>
						<span>100%</span>
					</div>
				</div>
			</div>

			<!-- Quick Presets -->
			<div class="space-y-3">
				<Label class="text-base font-medium">Quick Presets</Label>
				<div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
					<button
						onclick={() =>
							onSettingsChange({
								readOwnLines: false,
								beepOnOwnLines: true,
								playbackSpeed: 1.0,
								pauseDuration: 2.0,
								volume: 0.8
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Practice Mode</div>
						<div class="text-xs text-muted-foreground">Beep cues only</div>
					</button>

					<button
						onclick={() =>
							onSettingsChange({
								readOwnLines: true,
								beepOnOwnLines: false,
								playbackSpeed: 1.0,
								pauseDuration: 1.5,
								volume: 0.8
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Full Read</div>
						<div class="text-xs text-muted-foreground">Read everything</div>
					</button>

					<button
						onclick={() =>
							onSettingsChange({
								readOwnLines: true,
								beepOnOwnLines: true,
								playbackSpeed: 0.8,
								pauseDuration: 3.0,
								volume: 0.7
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Learning Mode</div>
						<div class="text-xs text-muted-foreground">Slow & clear</div>
					</button>
				</div>
			</div>
		</CardContent>
	</Card>
</div>
