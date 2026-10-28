<script lang="ts">
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#lib/components/ui/select/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import UserIcon from '@lucide/svelte/icons/user';
	import UsersIcon from '@lucide/svelte/icons/users';
	import PlayIcon from '@lucide/svelte/icons/play';
	import { ttsService, type Character, type ScriptLine } from '#lib/services/tts/TtsService.js';
	import { toast } from 'svelte-sonner';

	let {
		characters,
		script,
		onCharactersChange
	}: {
		characters: Character[];
		script: ScriptLine[];
		onCharactersChange: (characters: Character[]) => void;
	} = $props();

	// Available TTS voices (simplified for demo - in real app these would be dynamic)
	const AVAILABLE_VOICES = [
		{ id: 'voice-1', name: 'Natural Male', gender: 'male' },
		{ id: 'voice-2', name: 'Natural Female', gender: 'female' },
		{ id: 'voice-3', name: 'Dramatic Male', gender: 'male' },
		{ id: 'voice-4', name: 'Dramatic Female', gender: 'female' },
		{ id: 'voice-5', name: 'Elderly Male', gender: 'male' },
		{ id: 'voice-6', name: 'Elderly Female', gender: 'female' },
		{ id: 'voice-7', name: 'Youth Male', gender: 'male' },
		{ id: 'voice-8', name: 'Youth Female', gender: 'female' }
	];

	let previewingCharacter = $state<string | null>(null);

	// Extract unique characters from script
	const scriptCharacters = $derived.by(() => {
		const characterIds = new Set(
			script.filter((line) => line.type === 'dialogue').map((line) => line.characterId)
		);
		return Array.from(characterIds);
	});

	// Ensure all script characters are in the characters array
	$effect(() => {
		const missingCharacters = scriptCharacters.filter(
			(charId) => !characters.find((c) => c.id === charId)
		);

		if (missingCharacters.length > 0) {
			const newCharacters = missingCharacters.map((charId, index) => ({
				id: charId,
				name: charId.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
				voiceId: AVAILABLE_VOICES[index % AVAILABLE_VOICES.length].id,
				isUserCharacter: false
			}));

			onCharactersChange([...characters, ...newCharacters]);
		}
	});

	function updateCharacter(characterId: string, updates: Partial<Character>) {
		const updatedCharacters = characters.map((char) =>
			char.id === characterId ? { ...char, ...updates } : char
		);
		onCharactersChange(updatedCharacters);
	}

	async function previewVoice(characterId: string) {
		const character = characters.find((c) => c.id === characterId);
		if (!character) return;

		try {
			previewingCharacter = characterId;
			const sampleText = `Hello, I am ${character.name}. This is how I sound with this voice setting.`;

			await ttsService.speak(sampleText, {
				readOwnLines: true,
				beepOnOwnLines: false,
				playbackSpeed: 1.0,
				pauseDuration: 1.0,
				volume: 0.8
			});
		} catch (error) {
			toast.error('Preview Failed', {
				description: 'Unable to preview voice. Make sure TTS is initialized.'
			});
		} finally {
			previewingCharacter = null;
		}
	}

	function getCharacterLines(characterId: string): number {
		return script.filter((line) => line.type === 'dialogue' && line.characterId === characterId)
			.length;
	}

	const userCharacters = $derived(characters.filter((c) => c.isUserCharacter));
</script>

<div class="w-full max-w-4xl mx-auto p-6">
	<Card class="bg-card border-border">
		<CardHeader>
			<CardTitle class="font-theatrical text-2xl text-accent flex items-center">
				<UsersIcon class="w-6 h-6 mr-2" />
				Character Configuration
			</CardTitle>
			<CardDescription>Assign voices to characters and select your roles</CardDescription>
		</CardHeader>

		<CardContent class="space-y-6">
			<!-- User Roles Summary -->
			{#if userCharacters.length > 0}
				<div class="p-4 bg-accent/10 rounded-lg border border-accent/20">
					<h3 class="font-medium mb-2 flex items-center text-accent">
						<UserIcon class="w-4 h-4 mr-2" />
						Your Roles ({userCharacters.length})
					</h3>
					<div class="flex flex-wrap gap-2">
						{#each userCharacters as char (char.id)}
							<Badge variant="secondary" class="bg-accent/20 text-accent">
								{char.name}
							</Badge>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Character List -->
			<div class="space-y-4">
				{#each characters as character (character.id)}
					<Card class="p-4 bg-secondary/50">
						<div class="flex items-center justify-between flex-wrap gap-4">
							<div class="flex items-center space-x-4 min-w-0 flex-1">
								<div class="flex items-center space-x-2">
									<Checkbox
										checked={character.isUserCharacter}
										onCheckedChange={(checked: boolean) =>
											updateCharacter(character.id, { isUserCharacter: !!checked })}
									/>
									<div class="min-w-0">
										<h3 class="font-medium text-foreground truncate">
											{character.name}
										</h3>
										<p class="text-sm text-muted-foreground">
											{getCharacterLines(character.id)} lines
										</p>
									</div>
								</div>
							</div>

							<div class="flex items-center space-x-3">
								<div class="min-w-[200px]">
									<Select
										type="single"
										value={character.voiceId}
										onValueChange={(voiceId: string) =>
											updateCharacter(character.id, { voiceId })}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select voice" />
										</SelectTrigger>
										<SelectContent>
											{#each AVAILABLE_VOICES as voice (voice.id)}
												<SelectItem value={voice.id} label={voice.name} />
											{/each}
										</SelectContent>
									</Select>
								</div>

								<Button
									variant="outline"
									size="sm"
									onclick={() => previewVoice(character.id)}
									disabled={previewingCharacter === character.id}
								>
									<PlayIcon class="w-4 h-4 mr-1" />
									{previewingCharacter === character.id ? 'Playing...' : 'Preview'}
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			</div>

			{#if characters.length === 0}
				<div class="text-center py-8 text-muted-foreground">
					<UsersIcon class="w-12 h-12 mx-auto mb-4 opacity-50" />
					<p class="text-lg">No characters found</p>
					<p class="text-sm mt-2">Load a script to see available characters</p>
				</div>
			{/if}

			<!-- Quick Actions -->
			{#if characters.length > 0}
				<div class="flex flex-wrap gap-2 pt-4 border-t border-border">
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const updated = characters.map((c) => ({ ...c, isUserCharacter: false }));
							onCharactersChange(updated);
						}}
					>
						Clear All User Roles
					</Button>

					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const updated = characters.map((c, index) => ({
								...c,
								voiceId: AVAILABLE_VOICES[index % AVAILABLE_VOICES.length].id
							}));
							onCharactersChange(updated);
						}}
					>
						Auto-Assign Voices
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>
