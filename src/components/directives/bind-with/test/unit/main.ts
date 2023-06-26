/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import {Component} from 'tests/helpers';
import type {JSHandle, Locator, Page} from 'playwright';
import type iBlock from 'components/super/i-block/i-block';
import type {Listener} from 'components/directives/bind-with';

/**
 * A call to v-bind-with's .then() or .catch()
 */
interface TestBindWithCallInfo {
	args: any[];
}

/**
 * A history of calls to v-bind-with's .then()/.catch()
 */
interface TestBindWithInfo {
	calls: TestBindWithCallInfo[];
	errorCalls: TestBindWithCallInfo[];
}

test.describe('<div v-bind-with>', () => {

	let rootHandle: JSHandle<iBlock>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		rootHandle = (await Component.getComponentByQuery(page, '#root-component'))!;
	});

	test.afterEach(async ({page}) => {
		await Component.removeCreatedComponents(page);
	});

	test('handler execution on event emission', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			on: 'testEvent'
		});
		await rootHandle.evaluate((root) => {
			root.emit('testEvent');
		});

		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('handler execution on field change', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			path: 'testField'
		});
		await rootHandle.evaluate((root) => {
			root.field.set('testField', 0);
		});

		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('handler execution inside callback', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			callback: (handler) => [1].forEach(handler)
		});
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.calls[0].args).toStrictEqual([1, 0, [1]]);
	});

	test('handler execution on promise resolution', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			promise: () => Promise.resolve()
		});
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.errorCalls.length).toBe(0);
	});

	test('error handler execution on promise rejection', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			promise: () => Promise.reject()
		});
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(0);
		test.expect(info!.errorCalls.length).toBe(1);
	});

	test('single handler execution with `once` option', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			once: 'testEvent'
		});
		await rootHandle.evaluate((root) => {
			root.emit('testEvent');
			root.emit('testEvent');
		});

		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('correctness of handler arguments', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			on: 'onTestEvent'
		});
		await rootHandle.evaluate((root) => {
			root.emit('testEvent', 1, 2, 3);
		});

		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls[0].args).toStrictEqual([1, 2, 3]);
	});

	test('multiple handler executions when array is passed', async ({page}) => {
		const divLocator = await createDivForTest(page, [
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

		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(2);
	});

	/**
	 * A handler to pass as .then() in v-bind-with
	 *
	 * @param element - The target element
	 * @param args - Args provided by v-bind-with trigger (on/path/callback...)
	 */
	function handler(element: HTMLElement, ...args: any[]) {
		const previousInfo: Partial<TestBindWithInfo> =
			JSON.parse(element.getAttribute('data-test-bind-with') ?? '{}');
		const newInfo: TestBindWithInfo = {
			calls: [
				...(previousInfo.calls ?? []),
				{
					// Avoid converting circular structure to JSON
					args: args.map(
						(a: any) => !Boolean(a) || typeof a.toString === 'function' ? a : null
					)
				}
			],
			errorCalls: previousInfo.errorCalls ?? []
		};
		element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	/**
	 * A handler to pass as .catch() in v-bind-with
	 *
	 * @param element - The target argument
	 * @param args - Args provided by v-bind-with trigger (on/path/callback...)
	 */
	function errorHandler(element: HTMLElement, ...args: any[]) {
		const previousInfo: Partial<TestBindWithInfo> =
			JSON.parse(element.getAttribute('data-test-bind-with') ?? '{}');
		const newInfo: TestBindWithInfo = {
			calls: previousInfo.calls ?? [],
			errorCalls: [
				...(previousInfo.errorCalls ?? []),
				{
					// Avoid converting circular structure to JSON
					args: args.map(
						(a: any) => !Boolean(a) || typeof a.toString === 'function' ? a : null
					)
				}
			]
		};
		element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	/**
	 * Force put our handlers to given v-bind-with listener.
	 * @param listener - A v-bind-with listener to process
	 */
	function processListener(listener: Partial<Listener>) {
		return {
			...listener,
			then: handler,
			catch: errorHandler
		};
	}

	/**
	 * Create a <div> with v-bind-with set by test code.
	 *
	 * @param page - The page.
	 * @param bindWithValue - Value to pass to v-bind-with
	 */
	async function createDivForTest(page: Page, bindWithValue: CanArray<Partial<Listener>>) {
		await Component.createComponent(page, 'div', {
			'v-bind-with': Object.isArray(bindWithValue) ?
				bindWithValue.map(processListener) :
				processListener(bindWithValue),
			'data-testid': 'div'
		});

		return page.getByTestId('div');
	}

	/**
	 * Get v-bind-with calls info by given locator
	 * @param locator - The source locator
	 */
	async function getBindWithInfo(locator: Locator): Promise<TestBindWithInfo | null> {
		const attrValue = await locator.getAttribute('data-test-bind-with');
		if (attrValue == null) {
			return null;
		}

		return <TestBindWithInfo>JSON.parse(attrValue);
	}

});
