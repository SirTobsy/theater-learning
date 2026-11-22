<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import { Slider } from '#lib/components/ui/slider/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
    import type {TTSSettings} from '#lib/services/tts/TtsService.js';
    import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "#lib/components/ui/select/index.ts"
    import {TTS_MODELS, isTtsModelId} from "#lib/services/tts/models.ts";

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

                    <!-- Practice Mode -->
					<button
						onclick={() =>
							onSettingsChange({
							    model: settings.model,
								readOwnLines: false,
								beepOnOwnLines: true,
								pauseDuration: 2.0,
								volume: 0.8
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Practice Mode</div>
						<div class="text-xs text-muted-foreground">Beep cues only</div>
					</button>

                    <!-- Full Read -->
					<button
						onclick={() =>
							onSettingsChange({
                                model: settings.model,
								readOwnLines: true,
								beepOnOwnLines: false,
								pauseDuration: 1.5,
								volume: 0.8
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Full Read</div>
						<div class="text-xs text-muted-foreground">Read everything</div>
					</button>

                    <!-- Learning Mode -->
					<button
						onclick={() =>
							onSettingsChange({
							    model: settings.model,
								readOwnLines: true,
								beepOnOwnLines: true,
								pauseDuration: 3.0,
								volume: 0.7
							})}
						class="p-3 border border-border rounded-lg hover:bg-accent/10 transition-colors"
					>
						<div class="font-medium text-sm">Learning Mode</div>
						<div class="text-xs text-muted-foreground">Longer pauses</div>
					</button>
				</div>
			</div>

            <!-- Model Selection -->
            <div class="space-y-3">
                <Label class="text-base font-medium">TTS Model</Label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select
                    type="single"
                    items={TTS_MODELS.map((model) => ({ value: model.id, label: model.name }))}
                    value={settings.model}
                    onValueChange={(modelId) => {
                        if (isTtsModelId(modelId)) updateSetting('model', modelId);
                    }}
                    >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                        {#each TTS_MODELS as model (model.id)}
                            <SelectItem value={model.id} label={model.name} />
                        {/each}
                    </SelectContent>
                    </Select>
                </div>
            </div>
		</CardContent>
	</Card>
</div>
