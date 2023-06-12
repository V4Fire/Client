/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Test cases of the component lifecycle
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';
import type { ComponentItemFactory } from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';

test.describe('<b-scrolly> with chunkSize preset', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider:Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.skip('Should render components', async () => {
		// ...
	});
});
