/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file This file contains test cases to verify the functionality of prop changes in components.
 */

import test from 'tests/config/unit/test';

import { createTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers';
import type { VirtualScrollTestHelpers } from 'components/base/b-virtual-scroll/test/api/helpers/interface';
import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

test.describe('<b-virtual-scroll>', () => {
	let
		component: VirtualScrollTestHelpers['component'],
		provider: VirtualScrollTestHelpers['provider'],
		state: VirtualScrollTestHelpers['state'];

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		({component, provider, state} = await createTestHelpers(page));
		await provider.start();
	});

	test.describe('`chunkSize` prop changes after the first chunk has been rendered', () => {
		test('Should render the second chunk with the new chunk size', async ({demoPage}) => {
			const
				chunkSize = 12;

			provider.response(200, () => ({data: state.data.addData(chunkSize)}));

			await component
				.withDefaultPaginationProviderProps({chunkSize})
				.withProps({
					chunkSize,
					'@hook:beforeDataCreate': (ctx: bVirtualScroll) => jestMock.spy(ctx.componentFactory, 'produceComponentItems')
				})
				.pick(demoPage.buildTestComponent(component.componentName, component.props));

			await component.waitForContainerChildCountEqualsTo(chunkSize);
			await demoPage.updateTestComponent({chunkSize: chunkSize * 2});
			await component.scrollToBottom();
			await component.waitForContainerChildCountEqualsTo(chunkSize * 3);

			const
				produceSpy = await component.getSpy((ctx) => ctx.componentFactory.produceComponentItems);

			test.expect(provider.mock.mock.calls.length).toBe(3);
			await test.expect(produceSpy.calls).resolves.toHaveLength(2);
			await test.expect(component.waitForContainerChildCountEqualsTo(chunkSize * 3)).resolves.toBeUndefined();
			await test.expect(component.waitForDataIndexChild(chunkSize * 3 - 1)).resolves.toBeUndefined();
		});
	});

	test.skip('`requestQuery`', () => {
		test.describe('Prop was changed', () => {
			test('Should not reload the entire component', async () => {
				// ...
			});

			test('Should request the second chunk with the new parameters', async () => {
				// ...
			});
		});

		test('Передает параметры в GET параметры запроса', async () => {
			// ...
		});
	});
});
