/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { BOM } from 'tests/helpers';

import { createTestHelpers } from 'components/base/b-virtual-scroll-new/test/api/helpers';

test.describe('<b-virtual-scroll-new>', () => {
	let
		component: Awaited<ReturnType<typeof createTestHelpers>>['component'],
		provider: Awaited<ReturnType<typeof createTestHelpers>>['provider'],
		state: Awaited<ReturnType<typeof createTestHelpers>>['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();

		await component.withChildren({
			tombstone: {
				type: 'div',
				attrs: {
					class: ['tombstone']
				}
			}
		});

		await component.withProps({
			tombstoneCount: 4,
			preloadAmount: 10
		});

		await page.addStyleTag({content: `
			.tombstone {
				width: 200px;
				height: 200px;
				margin: 16px;
				background-color: gray;
			}
			.b-virtual-scroll-new__container {
				min-width: initial !important;
				min-height: initial !important;
			}
		`});
	});

	test.describe('tombstones switch to content', () => {
		test('should not generate cls on initial loading', async ({page}) => {
			const chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));
			provider.responder();

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			const score = await BOM.clsScore(page, async () => {
				await provider.unresponder();
				await component.waitForDataIndexChild(chunkSize - 1);
			});

			test.expect(score).toBe(0);
		});

		test('should not generate cls on second loading', async ({page}) => {
			const chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));
			provider.responder();

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({chunkSize})
				.build();

			const score = await BOM.clsScore(page, async () => {
				await provider.unresponder();
				await component.waitForDataIndexChild(chunkSize - 1);
				await component.scrollToBottom();
				await component.waitForDataIndexChild(chunkSize * 2 - 1);
			});

			test.expect(score).toBe(0);
		});
	});
});
