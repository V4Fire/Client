/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import BOM from 'tests/helpers/bom';
import Component from 'tests/helpers/component';

import type bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

/**
 * Renders the `bBottomSlide` component and returns JSHandle
 *
 * @param page
 * @param [attrs]
 * @param [children]
 */
export async function renderBottomSlide(
	page: Page,
	attrs?: RenderComponentsVnodeParams['attrs'],
	children?: RenderComponentsVnodeParams['children']
): Promise<JSHandle<bBottomSlide>> {
	const component = await Component.createComponent<bBottomSlide>(
		page,
		'b-bottom-slide',
		{
			attrs: {
				...attrs,
				id: 'target'
			},

			children: children ?? {
				default: {
					attrs: {
						id: 'test-div'
					},
					type: 'div',
					children: {
						default: 'Hello content'
					}
				}
			}
		}
	);

	await BOM.waitForIdleCallback(page);

	return component;
}

/**
 * Invokes the `open` method of the specified component
 *
 * @param page
 * @param component
 * @param [step]
 */
export async function open(page: Page, component: JSHandle<bBottomSlide>, step?: number): Promise<void> {
	await component.evaluate((ctx, [step]) => ctx.open(step), [step]);
	await BOM.waitForIdleCallback(page);
}

/**
 * Invokes the `close` method of the specified component
 *
 * @param page
 * @param component
 */
export async function close(page: Page, component: JSHandle<bBottomSlide>): Promise<void> {
	await component.evaluate((ctx) => ctx.close());
	await BOM.waitForIdleCallback(page);
}

/**
 * Invokes the `next` method of the specified component
 *
 * @param page
 * @param component
 */
export async function next(page: Page, component: JSHandle<bBottomSlide>): Promise<void> {
	await component.evaluate((ctx) => ctx.next());
	await BOM.waitForIdleCallback(page);
}

/**
 * Invokes the `prev` method of the specified component
 *
 * @param page
 * @param component
 */
export async function prev(page: Page, component: JSHandle<bBottomSlide>): Promise<void> {
	await component.evaluate((ctx) => ctx.prev());
	await BOM.waitForIdleCallback(page);
}

/**
 * Returns a value of the global window height
 *
 * @param page
 * @param [percent] - percentage of the resulting height to return
 */
export function getAbsolutePageHeight(page: Page, percent: number = 100): Promise<number> {
	return page.evaluate((percent) => Math.round(globalThis.innerHeight / 100 * percent), percent);
}

/**
 * Returns an offset between the global window and the component window element
 * @param component
 */
export function getAbsoluteComponentWindowOffset(component: JSHandle<bBottomSlide>): Promise<number> {
	return component.evaluate((ctx) => Math.round(globalThis.innerHeight - ctx.unsafe.block!.element('window')!.getBoundingClientRect().y));
}

/**
 * Returns `offsetHeight` of the `window` element from the specified component
 * @param component
 */
export function getAbsoluteComponentWindowHeight(component: JSHandle<bBottomSlide>): Promise<number> {
	return component.evaluate((ctx) => (<HTMLElement>ctx.unsafe.block!.element('window'))!.offsetHeight);
}

/**
 * Returns an `y` position from the component `boundedClientRect`
 * @param component
 */
export function getComponentWindowYPos(component: JSHandle<bBottomSlide>): Promise<number> {
	return component.evaluate((ctx) => Math.round(ctx.unsafe.block!.element('window')!.getBoundingClientRect().y));
}
