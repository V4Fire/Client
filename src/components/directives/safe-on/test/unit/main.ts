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
	let mockCb: SpyObject;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		mockCb = await createMockFn(page, (...args) => args);
	});

	test.describe('with shorthand syntax', () => {
		test('should add event listener', async ({page}) => {
			const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
			const element = page.getByTestId('dynamicEvent');

			await element.evaluate((el, [component, mock]) => {
				component.on('onDynamicEvent', mock);

				el.dispatchEvent(new Event('click'));
			}, [component, mockCb.handle]);

			await test.expect(mockCb.calls).resolves.toEqual([['click']]);
		});

		test('should remove event listener if the vnode is unmounted', async ({page}) => {
			const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
			const element = page.getByTestId('dynamicEvent');

			await element.evaluate((el, [component, mock]) => new Promise((resolve) => {
				component.on('onDynamicEvent', mock);

				el.dispatchEvent(new Event('click'));

				component.isElementVisible = false;

				setTimeout(() => {
					el.dispatchEvent(new Event('click'));
					resolve(true);
				});
			}), [component, mockCb.handle]);

			await test.expect(mockCb.calls).resolves.toEqual([['click']]);
		});

		test('should remove event listener with modifiers if the vnode is unmounted', async ({page}) => {
			const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy', {
				dynamicEventName: 'click.stop'
			});

			const element = page.getByTestId('dynamicEvent');

			const mockStopPropagation = await createMockFn(page, () => undefined);

			await element.evaluate((el, [component, mockCb, mockStop]) => new Promise((resolve) => {
				component.on('onDynamicEvent', mockCb);

				const e = new Event('click');
				e.stopPropagation = mockStop;

				el.dispatchEvent(e);

				component.isElementVisible = false;

				setTimeout(() => {
					el.dispatchEvent(e);
					resolve(true);
				});
			}), [component, mockCb.handle, mockStopPropagation.handle]);

			await test.expect(mockStopPropagation.callsCount).resolves.toEqual(1);
		});

		test('should remove event listener if the event name is changed and the vnode is unmounted', async ({page}) => {
			const component = await Component.createComponent<bSafeOnDynamicEventDummy>(page, 'b-safe-on-dynamic-event-dummy');
			const element = page.getByTestId('dynamicEvent');

			await element.evaluate((el, [component, mock]) => new Promise((resolve) => {
				component.on('onDynamicEvent', mock);

				el.dispatchEvent(new Event('click'));

				component.dynamicEventName = 'pointerdown';

				component.$nextTick(() => {
					el.dispatchEvent(new Event('pointerdown'));

					component.isElementVisible = false;

					setTimeout(() => {
						el.dispatchEvent(new Event('click'));
						el.dispatchEvent(new Event('pointerdown'));
						resolve(true);
					});
				});
			}), <const>[component, mockCb.handle]);

			await test.expect(mockCb.calls).resolves.toEqual([['click'], ['pointerdown']]);
		});
	});

	test.describe('with longhand syntax', () => {
		test('should add event listener', async ({page}) => {
			const element = await renderDirective(page, 'click', mockCb);

			await element.click();

			await test.expect(mockCb.callsCount).resolves.toEqual(1);
		});

		test('should support event listener with modifiers', async ({page}) => {
			const element = await renderDirective(page, 'click.stop', mockCb);

			const mockStopPropagation = await createMockFn(page, (...args) => args);

			await element.evaluate((el, mock) => {
				const e = new Event('click');
				e.stopPropagation = mock;

				el.dispatchEvent(e);
			}, mockStopPropagation.handle);

			await test.expect(mockStopPropagation.callsCount).resolves.toEqual(1);
		});

		test('should support multiple event listeners', async ({page}) => {
			const element = await renderDirective(page, 'click', mockCb, {
				...createDirectiveWithVOn('pointerdown', mockCb),
				...createDirectiveWithVOn('blur', mockCb)
			});

			await element.dispatchEvent('click');
			await element.dispatchEvent('pointerdown');
			await element.dispatchEvent('blur');

			await test.expect(mockCb.callsCount).resolves.toEqual(3);
		});
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

					...createDirectiveWithVOn(eventName, callback),

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

function createDirectiveWithVOn(eventName: string, callback: SpyObject): Dictionary {
	return {
		[`@${eventName}`]: callback,
		[`v-safe-on:${eventName}`]: []
	};
}
