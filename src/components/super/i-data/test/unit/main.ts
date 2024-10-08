/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component, RequestInterceptor } from 'tests/helpers';
import { createMockFn } from 'tests/helpers/mock';

test.describe('<i-data> component', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should not update the `componentStatus` if the component was destroyed during the loading', async ({page}) => {
		const interceptor = new RequestInterceptor(page, /api/);
		await interceptor
			.response(200, {root: true}, {delay: 100})
			.start();

		const target = await Component.createComponent(page, 'b-dummy', {
			attrs: {
				dataProvider: 'Provider'
			}
		});

		const mockStatusChange = await createMockFn(page, (...args) => args);

		await target.evaluate((ctx, mock) => {
			ctx.on('onComponentStatusChange', mock);

			ctx.unsafe.$destroy();
		}, mockStatusChange.agent);

		test.expect(await mockStatusChange.calls).toEqual([['destroyed', 'loading']]);
	});
});
