<script lang="ts">
	import { Slider as SliderPrimitive } from 'bits-ui';
	import { cn } from '#lib/services/utils.js';

	let {
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		class: className,
		onValueChange,
		...restProps
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		class?: string;
		onValueChange?: (value: number) => void;
	} = $props();
</script>

<SliderPrimitive.Root
	bind:value
	type="single"
	{min}
	{max}
	{step}
	{onValueChange}
	class={cn('relative flex w-full touch-none select-none items-center', className)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary">
			<SliderPrimitive.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<SliderPrimitive.Thumb
				index={thumb.index}
				class="block size-4 rounded-full border-2 border-primary bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</SliderPrimitive.Root>
