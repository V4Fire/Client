/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable capitalized-comments, no-tabs, @typescript-eslint/no-unused-vars */

import { unimplement } from 'core/functools';

import type { ComponentApp } from 'core/component';
// import Component, { app, rootComponents, ComponentElement, ComponentApp } from 'core/component';

/**
 * Inits the app for the storybook canvas
 *
 * @param canvasElement - storybook canvas element
 * @param [rootComponent] - name of the root component
 */
export default async function initApp(canvasElement: HTMLElement, rootComponent?: string): Promise<ComponentApp> {
	unimplement({
		name: 'initApp',
		type: 'function',
		notice: 'The initialization of Storybook is temporarily unavailable'
	});

	return Object.cast({context: null, state: null});

	// const component = await rootComponents[rootComponent ?? 'p-v4-components-demo'];
	//
	// if (component == null) {
	// 	throw new ReferenceError('The root component is not found');
	// }
	//
	// const getData = component.data;
	//
	// component.data = function data(this: unknown): Dictionary {
	// 	return (Object.isFunction(getData) ? getData.call(this) : null) ?? {};
	// };
	//
	// app.context = new Component({
	// 	...component,
	// 	el: canvasElement
	// });
	//
	// Object.defineProperty(app, 'component', {
	// 	configurable: true,
	// 	enumerable: true,
	// 	get: () => document.querySelector<ComponentElement>('#root-component')?.component ?? null
	// });
	//
	// return app;
}
