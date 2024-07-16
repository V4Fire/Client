/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import { Component, RequestInterceptor, Utils } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';

import type * as TestProvider from 'core/data/middlewares/hydration-cache/test/provider';
import type * as HydrationCache from 'core/data/middlewares/hydration-cache';

test.describe('core/data/middlewares/hydration-cache', () => {
	test.beforeEach(async ({page, demoPage}) => {
		await demoPage.goto();

		const provider = new RequestInterceptor(page, /api/);

		provider.response(200, {message: 'ok'});
		await provider.start();
	});

	test('should save the response to the hydration store', async ({page}) => {
		const component = await Component.createComponent<bDummy>(page, 'b-dummy', {
			'data-id': 'target',
			dataProvider: 'test.HydrationCache'
		});

		await Component.waitForComponentStatus(page, '[data-id="target"]', 'ready');

		const response = await component.evaluate((ctx) => {
			if (ctx.dataProvider?.provider == null) {
				return;
			}

			const {provider} = ctx.dataProvider;

			return provider.params.remoteState?.hydrationStore.get(provider.providerName);
		});

		test.expect(Object.values(response!)[0]).toEqual({message: 'ok'});
	});

	test('should save the response using a custom `cacheId`', async ({page}) => {
		const component = await Component.createComponent<bDummy>(page, 'b-dummy');

		const testProviderAPI = await Utils.import<typeof TestProvider>(page, 'core/data/middlewares/hydration-cache/test/provider');
		const middlewareAPI = await Utils.import<typeof HydrationCache>(page, 'core/data/middlewares/hydration-cache');

		const testProvider = await testProviderAPI.evaluateHandle(({default: Provider}, [middlewareAPI, component]) => {
			// @ts-ignore (access)
			Provider.middlewares = {
				...Provider.middlewares,
				attachHydrationCache: middlewareAPI.attachHydrationCache({cacheId: () => 'customCacheId'})
			};

			return new Provider({id: component.remoteState.appProcessId, remoteState: component.remoteState});
		}, <const>[middlewareAPI, component]);

		await testProvider.evaluate((ctx) => ctx.get());

		const response = await testProvider.evaluate((ctx) => ctx.params.remoteState?.hydrationStore.get('customCacheId'));

		test.expect(Object.values(response!)[0]).toEqual({message: 'ok'});
	});
});
