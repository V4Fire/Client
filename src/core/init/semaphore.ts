/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import flags from '@src/core/init/flags';
import Component, { globalRootComponent, rootComponents } from '@src/core/component';
import { createsAsyncSemaphore } from '@src/core/event';

export default createsAsyncSemaphore(async () => {
	const
		node = document.querySelector<HTMLElement>('[data-root-component]');

	if (!node) {
		throw new ReferenceError('The root node is not found');
	}

	const
		name = node.getAttribute('data-root-component') ?? '',
		component = await rootComponents[name];

	if (component == null) {
		throw new ReferenceError('The root component is not found');
	}

	const
		getData = component.data,
		params = JSON.parse(node.getAttribute('data-root-component-params') ?? '{}');

	component.data = function data(this: unknown): Dictionary {
		return Object.assign(Object.isFunction(getData) ? getData.call(this) : {}, params.data);
	};

	// @ts-ignore (type)
	globalRootComponent.link = new Component({
		...params,
		...component,
		el: node
	});

	return globalRootComponent.link;
}, ...flags);
