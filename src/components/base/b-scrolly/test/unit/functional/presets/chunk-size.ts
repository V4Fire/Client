/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-scrolly/test/api/helpers';

test.describe('<b-scrolly> with chunkSize preset', () => {
	let
		provider:Awaited<ReturnType<typeof createTestHelpers>>['provider'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({provider} = await createTestHelpers(page));
		await provider.start();
	});

	test.skip('Should render components', async () => {
		// ...
	});
});
