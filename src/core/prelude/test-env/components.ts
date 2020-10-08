/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iStaticPage, { ComponentElement } from 'super/i-static-page/i-static-page';

export interface RenderParams {
	/**
	 * Component attrs
	 */
	attrs: Dictionary;

	/** @see [[RenderContent]] */
	content?: Dictionary<RenderContent | string>;
}

/**
 * Content to render into element
 *
 * @example
 *
 * ```typescript
 * globalThis.renderComponents('b-button', {
 *   attrs: {
 *      testProp: 1
 *   },
 *   content: {
 *     default: {
 *       tag: 'b-button',
 *       content: {
 *         default: 'Test'
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * This schema is the equivalent of such an entry in the template
 *
 * ```ss
 * < b-button :testProp = 1
 *   < b-button
 *     Test
 * ```
 */
export interface RenderContent {
	/**
	 * Component name or tagName
	 */
	tag: string;

	/**
	 * Component attrs
	 */
	attrs: Dictionary;

	/** @see [[RenderContent]] */
	content?: Dictionary<RenderContent | string>;
}

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
		rootEl = document.querySelector<ComponentElement<iStaticPage>>(<string>rootSelector),
		ctx = rootEl!.component!.unsafe;

	const buildScopedSlots = (content) => {
		const res = {};

		const createElement = (val) => {
			const
				{tag, attrs, content} = val;

			let
				convertedContent = content;

			if (Object.isPlainObject(convertedContent)) {
				convertedContent = createElement(content)();
				convertedContent = Object.isString(convertedContent) === false && Object.isArray(convertedContent) === false ?
					[convertedContent] :
					convertedContent;
			}

			return () => ctx.$createElement(<string>tag, {attrs: {'v-attrs': attrs}}, convertedContent);
		};

		Object.forEach(content, (val: Dictionary, key: string) => {
			res[key] = createElement(val);
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
