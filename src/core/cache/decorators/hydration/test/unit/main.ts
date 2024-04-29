/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Utils } from 'tests/helpers';

import type * as Cache from 'core/cache';

// @ts-ignore (vue)
import type * as Decorator from 'core/cache/decorators/hydration';
import type * as HydrationStore from 'core/hydration-store';

test.describe('core/cache/decorators/hydration', () => {
	let
		cache: JSHandle<Cache.Cache>,
		hydrationStore: JSHandle<HydrationStore.default>,
		decorator: JSHandle<ReturnType<typeof Decorator['addHydrationCache']>>;

	const
		hydrationId = 'hydrationId',
		hydrationCacheKey = 'hydrationCacheKey',
		serverCacheKey = 'serverCacheKey',
		clientCacheKey = 'clientCacheKey';

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		const cacheAPI = await Utils.import<typeof Cache>(page, './node_modules/@v4fire/core/src/core/cache');
		const hydrationAPI = await Utils.import<typeof HydrationStore>(page, 'core/hydration-store');
		const decoratorAPI = await Utils.import<typeof Decorator>(page, 'core/cache/decorators/hydration');

		cache = await cacheAPI.evaluateHandle((ctx) => new ctx.Cache());

		// We are imitating the server-side hydration
		hydrationStore = await hydrationAPI.evaluateHandle(({default: HydrationStore}) => new HydrationStore('server'));

		const args = <const>[
			cache,
			hydrationStore,
			hydrationId,
			hydrationCacheKey
		];

		decorator = await decoratorAPI.evaluateHandle(
			(ctx, [cache, hydrationStore, id, cacheKey]) =>
				ctx.addHydrationCache(cache, hydrationStore, {id, cacheKey}),

			args
		);
	});

	test('should add a new cache to the hydration store', async () => {
		await decorator.evaluate((ctx, key) => ctx.set(key, 'foo'), serverCacheKey);

		const data = await hydrationStore.evaluate(
			(ctx, [id, key]) => ctx.get(id, key),
			[hydrationId, hydrationCacheKey]
		);

		test.expect(data).toBe('foo');
	});

	test([
		'should get a cache from the hydration store,',
		'if the request cache key is different for the client and server'
	].join(' '), async () => {
		await decorator.evaluate((ctx, key) => ctx.set(key, 'foo'), serverCacheKey);

		const cacheValue = await decorator.evaluate((ctx, key) => ctx.get(key), clientCacheKey);

		test.expect(cacheValue).toBe('foo');
	});

	test('should get a cache from the hydration store and remove it', async () => {
		await decorator.evaluate((ctx, key) => ctx.set(key, 'foo'), serverCacheKey);

		await decorator.evaluate((ctx, key) => ctx.get(key), clientCacheKey);
		const hydrationValue = await decorator.evaluate((ctx, key) => ctx.get(key), hydrationCacheKey);

		test.expect(hydrationValue).toBeUndefined();
	});

	test('should save a value from the hydration store to the cache after getting it', async () => {
		await decorator.evaluate((ctx, key) => ctx.set(key, 'foo'), serverCacheKey);

		await decorator.evaluate((ctx, key) => ctx.get(key), clientCacheKey);

		const cacheValue = await cache.evaluate((ctx, key) => ctx.get(key), clientCacheKey);
		test.expect(cacheValue).toBe('foo');
	});
});
