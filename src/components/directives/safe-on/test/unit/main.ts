/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
import bDummy from 'components/dummies/b-dummy/b-dummy';
import { Locator, Page } from 'playwright';
import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';
import { createMockFn, SpyObject } from 'tests/helpers/mock';
import bSafeOnDynamicEventDummy from '../b-safe-on-dynamic-event-dummy/b-safe-on-dynamic-event-dummy';

test.describe('components/directives/safe-on', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should add event listener', async ({page}) => {
		const mockCb = await createMockFn(page, () => undefined);

		const {element} = await renderDirective(page, 'click', mockCb);

		await element.click();

		await test.expect(mockCb.callsCount).toBeResolvedTo(1);
	});

	test('should pass arguments to the callback', async ({page}) => {
		const mockCb = await createMockFn(page, (...args) => args);

		const {element} = await renderDirective(page, 'click', mockCb);

		await element.click();

		const calls = await mockCb.calls;

		test.expect(calls[0]).toMatchObject([test.expect.any(Object)]);
	});

	test('should update the event listener if the event type is changed', async ({page}) => {
		const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
		const element = page.getByTestId('dynamicEvent');

		const mockDynamicEvent = await createMockFn(page, (...args) => args);

		await component.evaluate((ctx, mock) => {
			ctx.on('onDynamicEvent', mock);
		}, mockDynamicEvent.handle);

		await element.click();

		await component.evaluate((ctx) => ctx.dynamicEventName = 'mouseup');

		await element.click();

		test.expect(await mockDynamicEvent.calls).toEqual([
			['click'],
			['mouseup']
		]);
	});

	test('should log an errors if the event type is not specified', async ({page, consoleTracker}) => {
		const mockCb = await createMockFn(page, () => undefined);

		consoleTracker.setMessageFilters({
			'v-safe-on': (msg) => msg.text()
		});

		const {element} = await renderDirective(page, '', mockCb);
		await element.click();

		const messages = await consoleTracker.getMessages();

		test.expect(messages).toHaveLength(1);
		test.expect(messages[0]).toMatch('Event type is not specified');
	});

	test('should log an errors if the handler is not a function', async ({page, consoleTracker}) => {
		consoleTracker.setMessageFilters({
			'v-safe-on': (msg) => msg.text()
		});

		const {element} = await renderDirective(page, 'click', Object.cast('foo'));
		await element.click();

		const messages = await consoleTracker.getMessages();

		test.expect(messages).toHaveLength(1);
		test.expect(messages[0]).toMatch('Expecting a function, got string');
	});

	test('should remove event listener if the component is destroyed', async ({page}) => {
		const mockCb = await createMockFn(page, () => undefined);

		const {element, destroy} = await renderDirective(page, 'click', mockCb);

		await element.click();
		await destroy();

		await element.click();

		await test.expect(mockCb.callsCount).toBeResolvedTo(1);
	});
});

async function renderDirective(page: Page, eventName: string, callback: SpyObject): Promise<{
	element: Locator;
	destroy(): Promise<void>;
}> {
	const component = await Component.createComponent<bDummy>(page, 'b-dummy', {
		children: {
			default: {
				type: 'div',

				attrs: {
					'data-testid': 'safe-on',
					[`v-safe-on:${eventName}`]: callback
				},

				children: {
					default: 'v-safe-on directive'
				}
			}
		}
	});

	const locator = page.getByTestId('safe-on');

	return {element: locator, destroy: () => component.evaluate((ctx) => ctx.unsafe.$destroy())};
}
