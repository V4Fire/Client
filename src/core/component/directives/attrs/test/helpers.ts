/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ElementHandle, Locator, Page } from 'playwright';

import type { Watcher } from 'components/directives/on-resize';

import { Component } from 'tests/helpers';

import type bComponentDirectivesEmitterDummy from 'core/component/directives/attrs/test/b-component-directives-emitter-dummy/b-component-directives-emitter-dummy'

export async function renderDummy(page: Page, attrs: RenderComponentsVnodeParams['attrs']) {
	return Component.createComponent<bComponentDirectivesEmitterDummy>(page, 'b-component-directives-emitter-dummy', {
		'data-testid': 'target',
		'v-attrs': {
			...attrs
		}
	});
}

export async function renderDirective(
	page: Page,
	componentName: string,
	attrs: RenderComponentsVnodeParams['attrs']
): Promise<Locator> {
	const componentTestId = 'target';
	await Component.createComponent(page, componentName, {
		'data-testid': componentTestId,
		'data-counter': 0,
		'v-attrs': {...attrs},
		style: 'width: 100px; height: 100px'
	});

	return page.getByTestId(componentTestId);
}

export async function waitForWatcherCallsCount(page: Page, observedEl: Locator, expected: number): Promise<void> {
	const handle = await observedEl.elementHandle();

	await page
		.waitForFunction(
			([div, val]) => Boolean(
				div.getAttribute('data-counter') === val.toString(10)
			),

			<[ElementHandle<HTMLElement>, number]>[handle, expected]
		);
}

export function resizeHandler(newRect: DOMRect, oldRect: DOMRect, watcher: Watcher): void {
	const {target} = watcher;

	const previousValue = parseInt(
		target.getAttribute('data-counter') ?? '0',
		10
	);

	const nextValue = previousValue + 1;
	target.setAttribute('data-counter', nextValue.toString());
}

export function clickHandler(event: MouseEvent): void {
	const target = <Element>event.target;

	const previousValue = parseInt(
		target.getAttribute('data-counter') ?? '0',
		10
	);

	const nextValue = previousValue + 1;
	target.setAttribute('data-counter', nextValue.toString());
}

export function dummyDeleteHandler(target: bComponentDirectivesEmitterDummy) {
	target.counter++;
}
