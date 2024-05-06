/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type iBlock from 'components/super/i-block/i-block';

import test from 'tests/config/unit/test';

import { BOM, Component, DOM } from 'tests/helpers';

test.describe('friends/module-loader', () => {
	const
		componentName = 'b-friends-module-loader-dummy',
		resultSelector = DOM.elNameSelectorGenerator(componentName, 'result');

	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test('should load dynamic modules from the template using `loadModules`', async ({page}) => {
		const target = await renderDummy(page, 'loading dynamic modules from a template');

		await target.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete'));

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	test('should load dynamic modules passed from the prop', async ({page}) => {
		await page.evaluate(() => {
			globalThis.loadFromProp = true;
		});

		const target = await renderDummy(page, 'loading dynamic modules passed from the prop');

		await target.evaluate(async (ctx) => ctx.waitComponentStatus('ready'));

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	test('simultaneous `loadModules` calls should function independently, and only relevant modules should render', async ({page}) => {
		const target = await renderDummy(page, 'simultaneous loadModules calls should function independently');

		await performAsyncRender(target, 'dummy1');
		await test.expect(page.locator(resultSelector)).toHaveText('Dummy module #1');
	});

	test('module should be loaded only after its associated "wait" function is resolved', async ({page}) => {
		let contents: Array<Promise<string>> = [];

		page.on('response', (response) => {
			if (response.url().endsWith('js')) {
				contents.push(response.text());
			}
		});

		const target = await renderDummy(page, 'load module only after wait is resolved');

		await BOM.waitForIdleCallback(page);

		await test.expect(
			Promise.all(contents).then((r) => r.every((text) => text.includes('dummy1')))
		).resolves.toBeTruthy();

		await test.expect(page.locator(resultSelector)).toHaveText('Dummy module #1');

		// eslint-disable-next-line require-atomic-updates
		contents = [];

		await performAsyncRender(target, 'dummy2');

		await test.expect(
			Promise.all(contents).then((r) => r.every((text) => text.includes('dummy2')))
		).resolves.toBeTruthy();

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	test('module should be loaded only after its associated signal is sent', async ({page}) => {
		let contents: Array<Promise<string>> = [];

		page.on('response', (response) => {
			if (response.url().endsWith('js')) {
				contents.push(response.text());
			}
		});

		const target = await renderDummy(page, 'load module only after signal received');

		await BOM.waitForIdleCallback(page);

		await test.expect(
			Promise.all(contents).then((r) => r.every((text) => text.includes('dummy1')))
		).resolves.toBeTruthy();

		await test.expect(page.locator(resultSelector)).toHaveText('Dummy module #1');

		// eslint-disable-next-line require-atomic-updates
		contents = [];

		await performAsyncRenderBySignal(target, 'dummy2');

		await test.expect(
			Promise.all(contents).then((r) => r.every((text) => text.includes('dummy2')))
		).resolves.toBeTruthy();

		await test.expect(page.locator(resultSelector)).toHaveText([
			'Dummy module #1',
			'Dummy module #2'
		].join(' '));
	});

	/**
	 * Returns the rendered `b-friends-module-loader-dummy` component
	 *
	 * @param page
	 * @param stage
	 */
	async function renderDummy(page: Page, stage: string) {
		await Component.waitForComponentTemplate(page, componentName);
		return Component.createComponent(page, componentName, {stage});
	}

	/**
	 * Initiates an asynchronous rendering of a specified component.
	 * The function returns a promise that resolves after the rendering process is completed.
	 *
	 * @param dummy
	 * @param target
	 */
	async function performAsyncRender(dummy: JSHandle<iBlock>, target: string): Promise<void> {
		const renderCompleted = dummy.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete'));
		await dummy.evaluate((ctx, target) => ctx.unsafe.localEmitter.emit(target), target);
		await renderCompleted;
	}

	/**
	 * Initiates an asynchronous rendering of a specified component using signal.
	 * The function returns a promise that resolves after the rendering process is completed.
	 *
	 * @param dummy
	 * @param target
	 */
	async function performAsyncRenderBySignal(dummy: JSHandle<iBlock>, target: string): Promise<void> {
		const renderCompleted = dummy.evaluate((ctx) => ctx.unsafe.localEmitter.promisifyOnce('asyncRenderComplete'));
		await dummy.evaluate((ctx, target) => ctx.unsafe.moduleLoader.sendSignal(target), target);
		await renderCompleted;
	}
});
