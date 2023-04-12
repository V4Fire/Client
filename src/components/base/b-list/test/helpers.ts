import type { BrowserContext, Page } from 'playwright';

/**
 * Provides an API to intercepts and mock response to the b-list request.
 * @param pageOrContext
 */
export async function interceptListRequest(
	pageOrContext: Page | BrowserContext
): Promise<void> {
	return pageOrContext.route(/api/, async (route) => route.fulfill({
		status: 200,
		contentType: 'application/json',
		body: JSON.stringify([
			{label: 'Foo', value: 'foo'},
			{label: 'Bar', value: 'bar'}
		])
	}));
}

