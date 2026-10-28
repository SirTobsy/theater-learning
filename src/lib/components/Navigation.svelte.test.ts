import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Navigation from './Navigation.svelte';

describe('Navigation', () => {
	it('calls onViewChange with the clicked view', async () => {
		const user = userEvent.setup();
		const onViewChange = vi.fn();

		render(Navigation, { currentView: 'script', onViewChange });

		await user.click(screen.getByText('Characters'));

		expect(onViewChange).toHaveBeenCalledWith('characters');
	});
});
