/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';
import { createMockFn, SpyObject } from 'tests/helpers/mock';

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type bSafeOnDynamicEventDummy from 'components/directives/safe-on/test/b-safe-on-dynamic-event-dummy/b-safe-on-dynamic-event-dummy';

test.describe('components/directives/safe-on', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should add event listener', async ({page}) => {
		const mockCb = await createMockFn(page, () => undefined);

		const element = await renderDirective(page, 'click', mockCb);

		await element.click();

		await test.expect(mockCb.callsCount).toBeResolvedTo(1);
	});

	test('should pass arguments to the callback', async ({page}) => {
		const mockCb = await createMockFn(page, (...args) => args);

		const element = await renderDirective(page, 'click', mockCb);

		await element.click();

		await test.expect(mockCb.calls).resolves.toMatchObject([[test.expect.any(Object)]]);
	});

	test('should update the event listener if the event type is changed', async ({page}) => {
		const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
		const element = page.getByTestId('dynamicEvent');

		const mockDynamicEvent = await createMockFn(page, (...args) => args);

		await component.evaluate((ctx, mock) => {
			ctx.on('onDynamicEvent', mock);
		}, mockDynamicEvent.handle);

		await element.dispatchEvent('click');

		await component.evaluate((ctx) => ctx.dynamicEventName = 'mouseup');

		await element.dispatchEvent('mouseup');

		test.expect(await mockDynamicEvent.calls).toEqual([
			['click'],
			['mouseup']
		]);
	});

	test('should remove the old event listener if the event type is changed', async ({page}) => {
		const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
		const element = page.getByTestId('dynamicEvent');

		const mockDynamicEvent = await createMockFn(page, () => undefined);

		await component.evaluate((ctx, mock) => {
			ctx.on('onDynamicEvent', mock);
		}, mockDynamicEvent.handle);

		await element.dispatchEvent('click');

		await component.evaluate((ctx) => ctx.dynamicEventName = 'mouseup');

		await element.dispatchEvent('click');

		await test.expect(mockDynamicEvent.calls).resolves.toEqual([['click']]);
	});

	test('should support multiple event types', async ({page}) => {
		const mockCb = await createMockFn(page, (...args) => args);

		const element = await renderDirective(page, 'pointerdown', mockCb, {
			'v-safe-on:pointerup': mockCb,
			'v-safe-on:focus': mockCb
		});

		await element.dispatchEvent('pointerdown');
		await element.dispatchEvent('pointerup');
		await element.dispatchEvent('focus');

		await test.expect(mockCb.callsCount).toBeResolvedTo(3);
	});

	test('should log an errors if the event type is not specified', async ({page, consoleTracker}) => {
		const mockCb = await createMockFn(page, () => undefined);

		consoleTracker.setMessageFilters({
			'v-safe-on': (msg) => msg.text()
		});

		const element = await renderDirective(page, '', mockCb);
		await element.click();

		const messages = await consoleTracker.getMessages();

		test.expect(messages).toHaveLength(1);
		test.expect(messages[0]).toMatch('Event type is not specified');
	});

	test('should log an errors if the handler is not a function', async ({page, consoleTracker}) => {
		consoleTracker.setMessageFilters({
			'v-safe-on': (msg) => msg.text()
		});

		const element = await renderDirective(page, 'click', Object.cast('foo'));
		await element.click();

		const messages = await consoleTracker.getMessages();

		test.expect(messages).toHaveLength(1);
		test.expect(messages[0]).toMatch('Expecting a function, got string');
	});

	test('should remove event listener if the vnode is unmounted', async ({page}) => {
		const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
		const element = page.getByTestId('dynamicEvent');

		const mockDynamicEvent = await createMockFn(page, () => undefined);

		await element.evaluate((el, [component, mock]) => new Promise((resolve) => {
			component.on('onDynamicEvent', mock);

			el.dispatchEvent(new Event('click'));

			component.isElementVisible = false;

			setTimeout(() => {
				el.dispatchEvent(new Event('click'));
				resolve(true);
			});
		}), [component, mockDynamicEvent.handle]);

		await test.expect(mockDynamicEvent.calls).resolves.toEqual([['click']]);
	});
});

async function renderDirective(
	page: Page,
	eventName: string,
	callback: SpyObject,
	attrs: Dictionary = {}
): Promise<Locator> {
	await Component.createComponent<bDummy>(page, 'b-dummy', {
		children: {
			default: {
				type: 'div',

				attrs: {
					'data-testid': 'safe-on',
					[`v-safe-on:${eventName}`]: callback,
					...attrs
				},

				children: {
					default: 'v-safe-on directive'
				}
			}
		}
	});

	return page.getByTestId('safe-on');
}
