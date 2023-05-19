/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import { componentData } from 'components/friends/state/test/const';
import { renderDummy, getValues, setValues } from 'components/friends/state/test/helpers';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

test.describe('friends/state using a router', () => {
	const data = {
		systemField: 'foo',
		regularField: 5,
		'mods.foo': 'baz'
	};

	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await initRouter(page);
	});

	test('should initialize state from the router on mount', async ({page}) => {
		await pushQueryDataToRouter();

		const target = await renderDummy(page);

		await test.expect(getValues(target)).resolves.toEqual(data);
	});

	test('should initialize state from the router when `initFromRouter` is invoked', async ({page}) => {
		const target = await renderDummy(page);

		await pushQueryDataToRouter();

		await test.expect(target.evaluate((ctx) => ctx.unsafe.state.initFromRouter())).resolves.toBeTruthy();

		await test.expect(getValues(target)).resolves.toEqual(data);
	});

	test('should sync state to the router when state of the component has changed', async ({page}) => {
		await pushQueryDataToRouter();

		const target = await renderDummy(page);

		await test.expect(getValues(target)).resolves.toEqual(data);

		await setValues(target, false);

		await test.expect(getValues(target)).resolves.toEqual(componentData);

		await test.expect(target.evaluate(({r}) => r.route?.query)).resolves.toEqual(componentData);
	});

	/**
	 * Initializes the `b-router` component and returns handle to root component
	 * @param page
	 */
	async function initRouter(page: Page): Promise<JSHandle<iStaticPage>> {
		await Component.createComponent(page, 'b-router', {
			routes: {
				notFound: {
					default: true,
					content: '404'
				}
			}
		});

		return Component.waitForRoot(page);
	}

	/**
	 * Pushes query data to the router
	 */
	async function pushQueryDataToRouter(): Promise<void> {
		await root.evaluate(({router}, query) => router!.push(null, {query}), data);
	}
});
