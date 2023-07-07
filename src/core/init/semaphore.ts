/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createsAsyncSemaphore } from 'core/event';

import { set } from 'core/component/state';
import Component, { app, rootComponents, hydrationStore, ComponentElement } from 'core/component';

import flags from 'core/init/flags';

export default createsAsyncSemaphore(async () => {
	if (SSR) {
		return async (name?: string) => {
			if (name == null) {
				throw new ReferenceError('The root component for rendering is not defined');
			}

			const
				component = await rootComponents[name];

			if (component == null) {
				throw new ReferenceError(`The specified root component "${name}" is not defined`);
			}

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const {renderToString} = require('vue/server-renderer');

			return {
				render: async (params: Dictionary = {}) => {
					Object.entries(params).forEach(([key, value]) => {
						set(key, value);
					});

					const root = new Component({
						...component,

						data() {
							return component.data?.call(this) ?? {};
						}
					});

					const text = await renderToString(root);
					return `${text}<noframes id="hydration-store" style="display: none">${hydrationStore.toString()}</noframes>`;
				}
			};
		};
	}

	const
		el = document.querySelector<HTMLElement>('[data-root-component]');

	if (el == null) {
		throw new ReferenceError('The root node is not found');
	}

	const
		name = el.getAttribute('data-root-component') ?? '',
		component = await rootComponents[name];

	if (component == null) {
		throw new ReferenceError('The root component is not found');
	}

	const
		params = JSON.parse(el.getAttribute('data-root-component-params') ?? '{}');

	if (Object.isDictionary(params.data)) {
		Object.entries(params.data).forEach(([key, value]) => {
			set(key, value);
		});
	}

	const
		getData = component.data;

	component.data = function data(this: unknown): Dictionary {
		return (Object.isFunction(getData) ? getData.call(this) : null) ?? {};
	};

	app.context = new Component({
		...params,
		...component,
		el
	});

	Object.defineProperty(app, 'component', {
		configurable: true,
		enumerable: true,
		get: () => document.querySelector<ComponentElement>('#root-component')?.component ?? null
	});

	return () => Promise.resolve({
		render() {
			return Promise.resolve(el);
		}
	});
}, ...flags);
