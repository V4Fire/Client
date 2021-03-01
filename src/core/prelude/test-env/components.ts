/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iStaticPage from 'super/i-static-page/i-static-page';
import type { ComponentElement } from 'super/i-static-page/i-static-page';

globalThis.renderComponents = (
	componentName: string,
	scheme: RenderParams[],
	options?: RenderOptions | string
) => {
	if (Object.size(options) === 0) {
		options = {rootSelector: '#root-component'};

	} else if (Object.isString(options)) {
		options = {rootSelector: '#root-component'};
	}

	const {selectorToInject, rootSelector} = {
		selectorToInject: options!.rootSelector,
		...options
	};

	const
		idAttrs = 'data-test-id',
		rootEl = document.querySelector<ComponentElement<iStaticPage>>(<string>rootSelector),
		ctx = rootEl!.component!.unsafe;

	const buildScopedSlots = (content) => {
		const res = {};

		const createElement = (val) => {
			if (Object.isFunction(val)) {
				return val;
			}

			return (obj?) => {
				const
					{tag, attrs, content} = val;

				let
					convertedContent = content;

				const
					getTpl = (tpl) => Object.isString(tpl) === false && Object.isArray(tpl) === false ? [tpl] : tpl;

				if (Object.isFunction(convertedContent)) {
					convertedContent = getTpl(convertedContent(obj));

				} else if (Object.isPlainObject(convertedContent)) {
					convertedContent = getTpl(createElement(content)(obj));
				}

				return ctx.$createElement(<string>tag, {attrs: {'v-attrs': attrs}}, convertedContent);
			};
		};

		Object.forEach(content, (val: Dictionary, key: string) => {
			res[key] = createElement(val);
		});

		return res;
	};

	const
		ids = scheme.map(() => Math.random());

	const vNodes = scheme.map(({attrs, content}, i) => ctx.$createElement(componentName, {
		attrs: {
			'v-attrs': {
				...attrs,
				[idAttrs]: ids[i]
			}
		},

		scopedSlots: buildScopedSlots(content)
	}));

	const
		nodes = ctx.vdom.render(vNodes);

	document.querySelector(<string>selectorToInject)?.append(...nodes);
	globalThis.__createdComponents = globalThis.__createdComponents ?? new Set();

	ids.forEach((id) => {
		globalThis.__createdComponents.add(document.querySelector(`[${idAttrs}="${id}"]`));
	});
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
