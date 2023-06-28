/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import { Component } from 'tests/helpers';

import type iBlock from 'components/super/i-block/i-block';
import {

	createDivForBindWithTest,
	getBindWithTestInfo

} from 'components/directives/bind-with/test/helpers';

test.describe('<div> v-bind-with', () => {

	let rootHandle: JSHandle<iBlock>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		rootHandle = await Component.waitForRoot(page);
	});

	test('handler should be executed when event is emitted', async ({page}) => {
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

	test('handler should be executed when field is changed', async ({page}) => {
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

	test('handler should be executed as a callback', async ({page}) => {

		const divLocator = await createDivForBindWithTest(page, {
			callback: (handler) => [1].forEach(handler)
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.calls[0].args).toStrictEqual([1, 0, [1]]);
	});

	test('handler should be executed when provided emitter emits an event', async ({page}) => {

		const divLocator = await createDivForBindWithTest(page, {
			emitter: (event: string, listener: AnyFunction) => {
				document.body.addEventListener(event, listener);
			},
			on: 'testEvent'
		});

		const bodyHandle = await page.evaluateHandle(() => document.body);

		await bodyHandle.evaluate((body) => {
			body.dispatchEvent(new Event('testEvent'));
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
	});

	test('handler should be executed when promise is resolved', async ({page}) => {

		const divLocator = await createDivForBindWithTest(page, {
			promise: () => Promise.resolve()
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(1);
		test.expect(info!.errorCalls.length).toBe(0);
	});

	test('error handler should be executed when promise is rejected', async ({page}) => {

		const divLocator = await createDivForBindWithTest(page, {
			promise: () => Promise.reject(new Error('rejection'))
		});

		const info = await getBindWithTestInfo(divLocator);
		test.expect(info).toBeTruthy();
		test.expect(info!.calls.length).toBe(0);
		test.expect(info!.errorCalls.length).toBe(1);
	});

	test('handler should be executed only once when `once` option is set', async ({page}) => {

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

	test('handler should receive correct arguments', async ({page}) => {

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

	test('handler should be executed on every event when array is passed', async ({page}) => {

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

});

