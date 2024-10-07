/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component, RequestInterceptor } from 'tests/helpers';

import type bSuperIDataEffectDummy from 'components/super/i-data/test/b-super-i-data-effect-dummy/b-super-i-data-effect-dummy';

test.describe('<i-data> component', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should not update the `componentStatus` if the component was destroyed during the loading', async ({page}) => {
		const interceptor = new RequestInterceptor(page, /api/);
		await interceptor
			.response(200, {root: true}, {delay: 100})
			.start();

		const target = await Component.createComponent<bSuperIDataEffectDummy>(page, 'b-dummy', {
			attrs: {
				'data-id': 'target',
				dataProvider: 'Provider'
			}
		});

		const mockStatusChange = await target.evaluateHandle(() => jestMock.mock());

		await target.evaluate((ctx, mockStatusChange) => {
			ctx.on('onComponentStatusChange', mockStatusChange);

			ctx.unsafe.$destroy();
		}, mockStatusChange);

		test.expect(await mockStatusChange.evaluate((fn) => fn.mock.calls)).toEqual([['destroyed', 'loading']]);
	});
});
