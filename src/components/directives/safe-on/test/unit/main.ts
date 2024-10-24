/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Locator, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';
import { createMockFn, SpyObject } from 'tests/helpers/mock';

import type bSafeOnDummy from 'components/directives/safe-on/test/b-safe-on-dummy/b-safe-on-dummy';

test.describe('components/directives/safe-on', () => {
	let mockCb: SpyObject;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		mockCb = await createMockFn(page, (...args) => args);
	});

	test('the listener should not be called if the vnode was unmounted', async ({page}) => {
		const {component, element} = await renderComponent(page, 'with only safe');

		await element.evaluate((el, component) => new Promise((resolve) => {
			el.dispatchEvent(new Event('click'));

			component.isElementVisible = false;

			setTimeout(() => {
				el.dispatchEvent(new Event('click'));
				resolve(true);
			});
		}), component);

		await test.expect(mockCb.callsCount).resolves.toBe(1);
	});

	test('should apply native v-on modifiers', async ({page}) => {
		const {component, element} = await renderComponent(page, 'with prevent and stop modifiers');

		const mockPrevent = await createMockFn(page, () => undefined);
		const mockStop = await createMockFn(page, () => undefined);

		await element.evaluate((el, [component, mockPrevent, mockStop]) => new Promise((resolve) => {
			const e = new Event('click');
			e.preventDefault = mockPrevent;
			e.stopPropagation = mockStop;
			el.dispatchEvent(e);

			component.isElementVisible = false;

			setTimeout(() => {
				el.dispatchEvent(e);
				resolve(true);
			});
		}), <const>[component, mockPrevent.handle, mockStop.handle]);

		await test.expect(mockCb.callsCount).resolves.toBe(1);
		await test.expect(mockPrevent.callsCount).resolves.toBe(1);
		await test.expect(mockStop.callsCount).resolves.toBe(1);
	});

	test('should call the listener with dynamic event name', async ({page}) => {
		const {component, element} = await renderComponent(page, 'with dynamic event name');

		await element.evaluate((el, component) => new Promise((resolve) => {
			el.dispatchEvent(new Event('click'));

			component.isElementVisible = false;

			setTimeout(() => {
				el.dispatchEvent(new Event('click'));
				resolve(true);
			});
		}), component);

		await test.expect(mockCb.callsCount).resolves.toBe(1);
	});

	async function renderComponent(
		page: Page,
		stage: string
	): Promise<{
		component: JSHandle<bSafeOnDummy>;
		element: Locator;
	}> {
		const component = await Component.createComponent<bSafeOnDummy>(page, 'b-safe-on-dummy', {
			stage
		});

		const element = page.getByTestId('trigger');

		await element.evaluate((_, [component, mock]) => {
			component.on('onEvent', mock);
		}, <const>[component, mockCb.handle]);

		return {component, element};
	}
});

