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

import type iBlock from 'components/super/i-block/i-block';
import type { Listener } from 'components/directives/bind-with';

test.describe('components/directives/bind-with', () => {
	let rootHandle: JSHandle<iBlock>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		rootHandle = await Component.waitForRoot(page);
	});

	test.describe('event binding', () => {
		test(
			'the handler should be executed when the component, within which the directive is used, fires an event',

			async ({page}) => {
				const el = await renderDirective(page, {
					on: 'testEvent'
				});

				await rootHandle.evaluate((root) => {
					root.emit('testEvent');
				});

				const
					info = await getBindWithTestInfo(el);

				test.expect(info).toBeTruthy();
				test.expect(info!.calls.length).toBe(1);
			}
		);

		test('the handler should be executed when the provided emitter fires an event', async ({page}) => {
			const el = await renderDirective(page, {
				emitter: (event: string, listener: AnyFunction) => {
					document.body.addEventListener(event, listener);
					return undefined;
				},

				on: 'testEvent'
			});

			await page.evaluateHandle(
				() => document.body.dispatchEvent(new Event('testEvent'))
			);

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(1);
		});

		test('the handler should be executed only once when the `once` option is set', async ({page}) => {
			const el = await renderDirective(page, {
				once: 'testEvent'
			});

			await rootHandle.evaluate((root) => {
				root.emit('testEvent');
				root.emit('testEvent');
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(1);
		});

		test('the handler should receive correct arguments', async ({page}) => {
			const el = await renderDirective(page, {
				on: 'onTestEvent'
			});

			await rootHandle.evaluate((root) => {
				root.emit('testEvent', 1, 2, 3);
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls[0].args).toStrictEqual([1, 2, 3]);
		});

		test(
			'the handler should be triggered when each of the specified events of the component is fired',

			async ({page}) => {
				const el = await renderDirective(page, [
					{
						once: 'testEvent'
					},

					{
						once: 'anotherTestEvent'
					}
				]);

				await rootHandle.evaluate((root) => {
					root.emit('testEvent');
					root.emit('anotherTestEvent');
				});

				const
					info = await getBindWithTestInfo(el);

				test.expect(info).toBeTruthy();
				test.expect(info!.calls.length).toBe(2);
			}
		);
	});

	test.describe("tracking changes of a component's property by a given path", () => {
		test('the handler should be executed when a property is changed', async ({page}) => {
			const el = await renderDirective(page, {
				path: 'testField'
			});

			await rootHandle.evaluate((root) => {
				root.field.set('testField', 0);
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(1);
		});
	});

	test.describe("passing the directive's handler as a handler to another function", () => {
		test('the handler should be executed as a callback', async ({page}) => {
			const el = await renderDirective(page, {
				callback: (handler) => [1].forEach(handler)
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(1);
			test.expect(info!.calls[0].args).toStrictEqual([1, 0, [1]]);
		});
	});

	test.describe("passing the directive's handler as a promise handler", () => {
		test('the handler should be executed when a promise is resolved', async ({page}) => {
			const el = await renderDirective(page, {
				promise: () => Promise.resolve()
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(1);
			test.expect(info!.errorCalls.length).toBe(0);
		});

		test('the error handler should be executed when a promise is rejected', async ({page}) => {
			const el = await renderDirective(page, {
				promise: () => Promise.reject(new Error('rejection'))
			});

			const
				info = await getBindWithTestInfo(el);

			test.expect(info).toBeTruthy();
			test.expect(info!.calls.length).toBe(0);
			test.expect(info!.errorCalls.length).toBe(1);
		});
	});

	interface BindWithTestCallInfo {
		args: unknown[];
	}

	interface BindWithTestInfo {
		calls: BindWithTestCallInfo[];
		errorCalls: BindWithTestCallInfo[];
	}

	/**
	 * A handler to pass to the `bind-with` directive
	 *
	 * @param el - the target element
	 * @param args - arguments provided by `bind-with` triggers (on/path/callback...)
	 */
	function handler(el: HTMLElement, ...args: unknown[]) {
		const previousInfo: Partial<BindWithTestInfo> =
			JSON.parse(el.getAttribute('data-test-bind-with') ?? '{}');

		const newInfo: BindWithTestInfo = {
			calls: previousInfo.calls ?? [],
			errorCalls: previousInfo.errorCalls ?? []
		};

		const preparedArgs = args.map(
			(arg) => {
				// Avoid converting circular structure to JSON
				try {
					JSON.stringify(arg);

				} catch {
					return null;
				}

				return arg;
			}
		);

		let
			callDestination: keyof BindWithTestInfo = 'calls';

		if (args.length > 0 && args[0] instanceof Error) {
			callDestination = 'errorCalls';
		}

		newInfo[callDestination].push({
			args: preparedArgs
		});

		el.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	async function renderDirective(page: Page, bindWithOpts: CanArray<Partial<Listener>>): Promise<Locator> {
		await Component.createComponent(page, 'div', {
			'v-bind-with': Object.isArray(bindWithOpts) ?
				bindWithOpts.map(addHandler) :
				addHandler(bindWithOpts),

			'data-testid': 'div'
		});

		return page.getByTestId('div');

		function addHandler(listener: Partial<Listener>) {
			return {
				...listener,
				then: handler,
				catch: handler
			};
		}
	}

	/**
	 * Returns information about the calls of the `bind-with` directive for a given element
	 * @param el
	 */
	async function getBindWithTestInfo(el: Locator): Promise<BindWithTestInfo | null> {
		const
			attrValue = await el.getAttribute('data-test-bind-with');

		if (attrValue == null) {
			return null;
		}

		return <BindWithTestInfo>JSON.parse(attrValue);
	}
});
