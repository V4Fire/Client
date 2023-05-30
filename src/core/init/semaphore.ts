/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createsAsyncSemaphore } from 'core/event';
import Component, { app, rootComponents, hydrationStore, ComponentElement } from 'core/component';

import flags from 'core/init/flags';

export default createsAsyncSemaphore(async () => {
	if (SSR) {
		return async (name: string) => {
			const component = await rootComponents[name];

			if (component == null) {
				throw new ReferenceError(`The specified root component "${name}" is not defined`);
			}

			// eslint-disable-next-line @typescript-eslint/no-var-requires
			const {renderToString} = require('vue/server-renderer');

			return {
				render: async (params?: Dictionary) => {
					const res = await renderToString(new Component({
						...component,

						data() {
							return Object.assign(component.data?.call(this), params);
						}
					}));

					return `${res}<noframes id="hydration-store" style="display: none">${hydrationStore.toString()}</noframes>`;
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
		getData = component.data,
		params = JSON.parse(el.getAttribute('data-root-component-params') ?? '{}');

	component.data = function data(this: unknown): Dictionary {
		return Object.assign(Object.isFunction(getData) ? getData.call(this) : {}, params.data);
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

	return () => el;
}, ...flags);
