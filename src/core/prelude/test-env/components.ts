/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iStaticPage, { ComponentElement } from 'super/i-static-page/i-static-page';

globalThis.renderComponents = (
	componentName: string,
	scheme: RenderScheme,
	options?: RenderOptions | string
) => {
	if (Object.size(options) === 0) {
		options = {rootSelector: '.i-block-helper'};

	} else if (Object.isString(options)) {
		options = {rootSelector: '.i-block-helper'};
	}

	const {selectorToInject, rootSelector} = {
		selectorToInject: options!.rootSelector,
		...options
	};

	const
		rootEl = document.querySelector<ComponentElement<iStaticPage>>(<string>rootSelector),
		ctx = rootEl!.component!.unsafe;

	const buildScopedSlots = (content) => {
		const res = {};

		Object.forEach(content, (val: Dictionary, key: string) => {
			const
				{tag, attrs, content} = val;

			res[key] = () => ctx.$createElement(<string>tag, {attrs: {'v-attrs': attrs}}, <string>content);
		});

		return res;
	};

	const vNodes = scheme.map(({attrs, content}) => ctx.$createElement(componentName, {
		attrs: {
			'v-attrs': attrs
		},

		scopedSlots: buildScopedSlots(content)
	}));

	const
		nodes = ctx.vdom.render(vNodes);

	document.querySelector(<string>selectorToInject)?.append(...nodes);

	globalThis.__createdComponents = globalThis.__createdComponents ?? new Set();
	nodes.forEach((node) => globalThis.__createdComponents.add(node));
};

globalThis.removeCreatedComponents = () => {
	const
		// @ts-expect-error (private)
		{__createdComponents} = globalThis;

	if (__createdComponents == null) {
		return;
	}

	__createdComponents.forEach((node) => {
		if (node.component != null) {
			node.component.$destroy();
		}

		node.remove();
	});

	__createdComponents.clear();
};
