/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';
import {Component} from "tests/helpers";
import type {JSHandle, Locator, Page} from "playwright";
import type iBlock from "components/super/i-block/i-block";

/**
 * A call to v-bind-with's .then() or .catch()
 */
type TestBindWithCallInfo = {
	args: any[]
}

/**
 * A history of calls to v-bind-with's .then()/.catch()
 */
type TestBindWithInfo = {
	calls: TestBindWithCallInfo[],
	errorCalls: TestBindWithCallInfo[],
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
		await rootHandle.evaluate(root => {
			root.emit('testEvent');
		});
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('handler execution on field change', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			path: 'testField',
		});
		await rootHandle.evaluate(root => {
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

	test.skip('handler execution on promise resolution', async ({page}) => {
		let resolveFn: (reason?: unknown) => void;
		const promise = new Promise((resolve) => {
			resolveFn = resolve;
		});
		const divLocator = await createDivForTest(page, {
			promise,
		});
		resolveFn!();
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.errorCalls.length).toBe(0);
	});

	test.skip('error handler execution on promise rejection', async ({page}) => {
		let rejectFn: (reason?: unknown) => void;
		const promise = new Promise((_, reject) => {
			rejectFn = reject;
		});
		const divLocator = await createDivForTest(page, {
			promise,
		});
		rejectFn!();
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(0);
		test.expect(info!.errorCalls.length).toBe(1);
	});

	test('single handler execution with `once` option', async ({page}) => {
		const divLocator = await createDivForTest(page, {
			once: 'testEvent'
		});
		await rootHandle.evaluate(root => {
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
		await rootHandle.evaluate(root => {
			root.emit('testEvent', 1, 2, 3);
		});
		const info = await getBindWithInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls[0].args).toStrictEqual([1, 2, 3]);
	});

	/**
	 * A handler to pass as .then() in v-bind-with
	 * @param element The target element
	 * @param args Args provided by v-bind-with trigger (on/path/callback...)
	 */
	function bindWithHandler(element: HTMLElement, ...args: any[]) {
		const previousInfo = JSON.parse(element.getAttribute('data-test-bind-with') || '{}');
		const newInfo: TestBindWithInfo = {
			calls: [
				...(previousInfo.calls ?? []),
				{args: args.map(a => !a || a.toString ? a : null)}
			],
			errorCalls: previousInfo.errorCalls ?? [],
		};
		element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	/**
	 * A handler to pass as .catch() in v-bind-with
	 * @param element The target argument
	 * @param args Args provided by v-bind-with trigger (on/path/callback...)
	 */
	function bindWithErrorHandler(element: HTMLElement, ...args: any[]) {
		const previousInfo = JSON.parse(element.getAttribute('data-test-bind-with') || '{}');
		const newInfo: TestBindWithInfo = {
			calls: previousInfo.calls ?? [],
			errorCalls: [
				...(previousInfo.errorCalls ?? []),
				{args: args.map(a => !a || a.toString ? a : null)}
			]
		};
		element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
	}

	/**
	 * Create a <div> with v-bind-with set by test code.
	 * @param page The page.
	 * @param bindWithAttrs Attributes to pass to v-bind-with
	 */
	async function createDivForTest(page: Page, bindWithAttrs: Record<string, any>) {
		await Component.createComponent(page, 'div', {
			'v-bind-with': {
				...bindWithAttrs,
				then: bindWithHandler,
				catch: bindWithErrorHandler,
			},
			'data-testid': 'div',
		});
		return page.getByTestId('div');
	}

	/**
	 * Get v-bind-with calls info by given locator
	 * @param locator The source locator
	 */
	async function getBindWithInfo(locator: Locator): Promise<TestBindWithInfo | null> {
		return JSON.parse(
			await locator.getAttribute('data-test-bind-with') || '0'
		) || null;
	}

});
