/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import { rootComponents } from 'core/component';

export let
	root: Vue | undefined;

document.addEventListener('DOMContentLoaded', async () => {
	const
		node = <HTMLElement | undefined>document.querySelector('[data-init-block]');

	if (!node) {
		throw new Error('Root node is not defined');
	}

	const
		name = <string>node.dataset.initBlock,
		component = await rootComponents[name];

	if (!component) {
		throw new Error('Root component is not defined');
	}

	const
		{data} = component,
		params = JSON.parse(<string>node.dataset.blockParams);

	component.data = function (): Dictionary {
		return Object.assign(data.call(this), params.data);
	};

	console.log({
		...params,
		...component
	});

	root = new Vue({
		...params,
		...component,
		el: node
	});

	READY_STATE++;
});
