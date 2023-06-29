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
import type { BindWithTestInfo } from 'components/directives/bind-with/test/interface';

test.describe('components/directives/bind-with', () => {
	let rootHandle: JSHandle<iBlock>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		rootHandle = await Component.waitForRoot(page);
	});

	test('the handler should be executed when an event is emitted', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			on: 'testEvent'
		});

		await rootHandle.evaluate((root) => {
			root.emit('testEvent');
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('the handler should be executed when a field is changed', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			path: 'testField'
		});

		await rootHandle.evaluate((root) => {
			root.field.set('testField', 0);
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('the handler should be executed as a callback', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			callback: (handler) => [1].forEach(handler)
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.calls[0].args).toStrictEqual([1, 0, [1]]);
	});

	test('the handler should be executed when the provided emitter emits an event', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			emitter: (event: string, listener: AnyFunction) => {
				document.body.addEventListener(event, listener);
			},
			on: 'testEvent'
		});

		await page.evaluateHandle(
			() => document.body.dispatchEvent(new Event('testEvent'))
		);

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('the handler should be executed when a promise is resolved', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			promise: () => Promise.resolve()
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.errorCalls.length).toBe(0);
	});

	test('the error handler should be executed when a promise is rejected', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			promise: () => Promise.reject(new Error('rejection'))
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(0);
		test.expect(info!.errorCalls.length).toBe(1);
	});

	test('the handler should be executed only once when `once` option is set', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			once: 'testEvent'
		});

		await rootHandle.evaluate((root) => {
			root.emit('testEvent');
			root.emit('testEvent');
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('the handler should receive correct arguments', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, {
			on: 'onTestEvent'
		});

		await rootHandle.evaluate((root) => {
			root.emit('testEvent', 1, 2, 3);
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls[0].args).toStrictEqual([1, 2, 3]);
	});

	test('the handler should be executed on every event when an array is passed', async ({page}) => {
		const divLocator = await createDivForBindWithTest(page, [
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

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(2);
	});

	/**
	 * A handler to pass as .then()/.catch() in v-bind-with
	 *
	 * @param element - the target element
	 * @param args - args provided by v-bind-with trigger (on/path/callback...)
	 */
	function handler(element: HTMLElement, ...args: any[]) {

		const previousInfo: Partial<BindWithTestInfo> =
			JSON.parse(element.getAttribute('data-test-bind-with') ?? '{}');

		const newInfo: BindWithTestInfo = {
			calls: previousInfo.calls ?? [],
			errorCalls: previousInfo.errorCalls ?? []
		};

		const preparedArgs = args.map(
			(arg: any) => {
				// Avoid converting circular structure to JSON
				try {
					JSON.stringify(arg);
				} catch (e) {
					return null;
				}

				return arg;
			}
		);

		let callDestination: keyof BindWithTestInfo = 'calls';

		if (args.length > 0 && args[0] instanceof Error) {
			callDestination = 'errorCalls';
		}

		newInfo[callDestination].push({
			args: preparedArgs
		});

		element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	/**
	 * Add our handlers to given v-bind-with listener.
	 * @param listener - a v-bind-with listener to process
	 */
	function addTestHandlersToListener(listener: Partial<Listener>) {
		return {
			...listener,
			then: handler,
			catch: handler
		};
	}

	/**
	 * Create a <div> with v-bind-with set by test code.
	 *
	 * @param page - the page.
	 * @param bindWithValue - value to pass to v-bind-with
	 */
	async function createDivForBindWithTest(
		page: Page, bindWithValue: CanArray<Partial<Listener>>
	): Promise<Locator> {
		await Component.createComponent(page, 'div', {
			'v-bind-with': Object.isArray(bindWithValue) ?
				bindWithValue.map(addTestHandlersToListener) :
				addTestHandlersToListener(bindWithValue),
			'data-testid': 'div'
		});

		return page.getByTestId('div');
	}

	/**
	 * Get v-bind-with calls info by given locator
	 * @param locator - the source locator
	 */
	async function getBindWithTestInfo(
		locator: Locator
	): Promise<BindWithTestInfo | null> {
		const attrValue = await locator.getAttribute('data-test-bind-with');

		if (attrValue == null) {
			return null;
		}

		return <BindWithTestInfo>JSON.parse(attrValue);
	}

});

