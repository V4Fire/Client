/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Page } from '@playwright/test';

import test from 'tests/config/unit/test';

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';

import Component from 'tests/helpers/component';
import Scroll from 'tests/helpers/scroll';
import BOM from 'tests/helpers/bom';
import { interceptPaginationRequest } from 'tests/network-interceptors/pagination';

test.describe('b-virtual-scroll render', () => {

	const appendStyles = async (page: Page) => {
		await page.addInitScript({content: `
			const styles = \`
				.b-virtual-scroll__option-el {
					position: relative;
					display: flex;
					justify-content: center;
					align-items: center;
					width: 200px;
					height: 200px;
					margin: 20px;
					background-color: #f00;
				}
				
				.b-virtual-scroll__option-el:after {
					content: attr(data-index);
					font-size: 20px;
					color: #fff;
				}
				
				.b-virtual-scroll__skeleton {
					width: 200px;
					height: 200px;
					margin: 20px;
					background-color: #808080;
				}
			\`;

			
			const styleElement = document.createElement('style');
			styleElement.innerHTML = styles;

			globalThis.addEventListener('DOMContentLoaded', () => {
				document.head.append(styleElement);
			});
		`});
	};

	const baseAttrs = {
		theme: 'demo',
		item: 'section',
		id: 'target',
		itemProps: ({current}) => ({'data-index': current.i})
	};

	const providerProps = (reqParams = {}) => ({
		dataProvider: 'Provider',
		chunkSize: 10,
		request: {get: {chunkSize: 10, id: Math.random(), ...reqParams}}
	});

	const attrs = (attrs = {}) => ({attrs: {
		...baseAttrs,
		...attrs
	}});

	const
		sectionSelector = '.b-virtual-scroll__container section',
		buttonSelector = '.b-virtual-scroll__container button',
		getContainerChildCount = (c) => c.evaluate((ctx) => ctx.$refs.container.childElementCount);

	test.beforeEach(async ({context, demoPage}) => {
		await interceptPaginationRequest(context);
		await appendStyles(demoPage.page);
		await demoPage.goto();
	});

	test.describe('with `dataProvider`', () => {
		test('renders the first chunk', async ({page}) => {
			const
				component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs(providerProps())),
				chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

			await page.waitForSelector(sectionSelector, {state: 'attached'});
			test.expect(await getContainerChildCount(component)).toBe(chunkSize);
		});

		test('renders b-button', async ({page}) => {
			const
				component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs({...providerProps(), item: 'b-button'})),
				chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

			await page.waitForSelector(buttonSelector, {state: 'attached'});
			test.expect(await getContainerChildCount(component)).toBe(chunkSize);
		});

		test('renders all available items', async ({page}) => {
			const
				component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs(providerProps({total: 40})));

			const
				total = await component.evaluate((ctx) => ctx.field.get('requestParams.get.total')),
				checkFn = async () => await getContainerChildCount(component) === total;

			await Scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});

			test.expect(await getContainerChildCount(component)).toBe(total);
		});

		test('does not render more than received data', async ({page}) => {
			const
				component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs(providerProps({total: 40})));

			const
				total = await component.evaluate((ctx) => ctx.field.get('requestParams.get.total')),
				checkFn = async () => await getContainerChildCount(component) === total;

			await Scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
			test.expect(await getContainerChildCount(component)).toBe(total);

			await BOM.waitForIdleCallback(page);
			await Scroll.scrollToBottom(page);
			test.expect(await getContainerChildCount(component)).toBe(total);
		});

		test('renders the first chunk with 3 requests to get the full chunk', async ({page}) => {
			const
				component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs(providerProps({chunkSize: 4})));

			const
				chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

			await page.waitForSelector(sectionSelector, {state: 'attached'});

			test.expect(await getContainerChildCount(component)).toBe(chunkSize);
		});

		test('renders the first chunk with truncated data in all loaded chunks', async ({page}) => {
			const component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs({
				dataProvider: 'Provider',
				chunkSize: 4,
				request: {get: {chunkSize: 8, total: 32, id: 'uniq'}},
				dbConverter: ({data}) => ({data: data.splice(0, 1)})
			}));

			const
				chunkSize = await component.evaluate((ctx) => ctx.chunkSize);

			await page.waitForSelector(sectionSelector, {state: 'attached'});

			test.expect(await getContainerChildCount(component)).toBe(chunkSize);
		});

		test('renders all data if `shouldStopRequest` returns true', async ({page}) => {
			const component = await Component.createComponent<bVirtualScroll>(page, 'b-virtual-scroll', attrs({
				dataProvider: 'Provider',
				chunkSize: 10,
				request: {get: {chunkSize: 40, total: 80, id: Math.random(), delay: 100}},
				shouldStopRequest: ({data}) => data.length === 80
			}));

			const
				checkFn = async () => await getContainerChildCount(component) === 80;

			await Scroll.scrollToBottomWhile(page, checkFn, {timeout: 1e5});
			test.expect(await getContainerChildCount(component)).toBe(80);
		});
	});
});
