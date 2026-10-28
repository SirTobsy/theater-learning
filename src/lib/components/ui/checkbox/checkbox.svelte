<script lang="ts">
	import { Checkbox as CheckboxPrimitive } from 'bits-ui';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { cn } from '$lib/services/utils';

	let {
		checked = $bindable(false),
		class: className,
		...restProps
	}: CheckboxPrimitive.RootProps = $props();
</script>

<CheckboxPrimitive.Root
	bind:checked
	class={cn(
		'peer size-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
		className
	)}
	{...restProps}
>
	{#snippet children({ checked: isChecked })}
		<div class="flex items-center justify-center text-current">
			{#if isChecked}
				<CheckIcon class="size-3.5" />
			{/if}
		</div>
	{/snippet}
</CheckboxPrimitive.Root>
