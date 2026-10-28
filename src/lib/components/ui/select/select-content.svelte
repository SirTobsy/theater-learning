<script lang="ts">
	import { Select as SelectPrimitive } from 'bits-ui';
	import { cn } from '$lib/services/utils';
	import type { Snippet } from 'svelte';

	let {
		class: className,
		sideOffset = 4,
		children,
		...restProps
	}: SelectPrimitive.ContentProps & { children?: Snippet } = $props();
</script>

<SelectPrimitive.Portal>
	<SelectPrimitive.Content
		{sideOffset}
		class={cn(
			'relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md',
			className
		)}
		{...restProps}
	>
		<SelectPrimitive.Viewport class="p-1">
			{@render children?.()}
		</SelectPrimitive.Viewport>
	</SelectPrimitive.Content>
</SelectPrimitive.Portal>
