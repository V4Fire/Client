/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component, RequestInterceptor } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

test.describe('components/friends/data-provider', () => {
	let provider: RequestInterceptor;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		provider = new RequestInterceptor(page, /api/);

		provider.response(200, {message: 'ok'});
		await provider.start();
	});

	test('should cancel a request promise if the component is destroyed when applying decoders', async ({page}) => {
		const component = await Component.createComponent<bDummy>(page, 'b-dummy', {
			attrs: {
				dataProvider: 'test.FriendsDataProvider'
			}
		});

		const mockResponseFn = await component.evaluateHandle(() => jestMock.mock());

		await component.evaluate((ctx, [mockResponseFn]) => {
			void ctx.dataProvider!
				.get()
				.then(() => mockResponseFn());

			ctx.dataProvider?.provider.emitter.once('friendsDataProviderDecoder', () => {
				ctx.unsafe.$destroy();
			});
		}, [mockResponseFn]);

		await new Promise((resolve) => setTimeout(resolve, 50));

		test.expect(await mockResponseFn.evaluate((fn) => fn.mock.calls)).toHaveLength(0);
		test.expect(provider.calls).toHaveLength(2);
	});
});
