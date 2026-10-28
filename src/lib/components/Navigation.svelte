<script lang="ts" module>
	export type ViewType = 'script' | 'settings' | 'characters';
</script>

<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import UsersIcon from '@lucide/svelte/icons/users';
	import SettingsIcon from '@lucide/svelte/icons/settings';

	let {
		currentView,
		onViewChange
	}: { currentView: ViewType; onViewChange: (view: ViewType) => void } = $props();

	const navItems = [
		{ id: 'script' as ViewType, label: 'Script', icon: FileTextIcon, description: 'Read & Practice' },
		{ id: 'characters' as ViewType, label: 'Characters', icon: UsersIcon, description: 'Voice Setup' },
		{ id: 'settings' as ViewType, label: 'Settings', icon: SettingsIcon, description: 'TTS Config' }
	];
</script>

<Card class="p-4 mb-6 bg-card border-border">
	<div class="flex flex-col sm:flex-row gap-2">
		{#each navItems as item (item.id)}
			{@const isActive = currentView === item.id}
			<Button
				variant={isActive ? 'default' : 'ghost'}
				onclick={() => onViewChange(item.id)}
				class={`flex-1 h-auto p-4 ${
					isActive
						? 'bg-gradient-primary text-primary-foreground shadow-theatrical'
						: 'hover:bg-accent/10'
				}`}
			>
				<div class="flex flex-col items-center space-y-2">
					<item.icon class="w-5 h-5" />
					<div class="text-center">
						<div class="font-medium">{item.label}</div>
						<div class="text-xs opacity-80">{item.description}</div>
					</div>
				</div>
			</Button>
		{/each}
	</div>
</Card>
