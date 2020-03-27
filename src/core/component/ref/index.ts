/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/ref/README.md]]
 * @packageDocumentation
 */

import { ComponentElement, ComponentInterface } from 'core/component/interface';

/**
 * Resolves refs from the specified component instance.
 *
 * This function replaces refs from component DOM nodes to component instances.
 * Also, this function fires events of appearance refs.
 *
 * @param component
 */
export function resolveRefs(component: ComponentInterface): void {
	const
		// @ts-ignore (access)
		{$refs, $refHandlers} = component;

	if (!$refs) {
		return;
	}

	for (let keys = Object.keys($refs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			el = $refs[key];

		if (!el) {
			continue;
		}

		if (Object.isArray(el)) {
			const
				arr = <unknown[]>[];

			let
				needRewrite;

			for (let i = 0; i < el.length; i++) {
				const
					listEl = el[i];

				let
					component;

				if (listEl instanceof Node) {
					component = (<ComponentElement>listEl).component;
					needRewrite = Boolean(component) && component.$el === listEl;

				} else {
					const {$el} = <ComponentInterface>listEl;
					component = $el.component;
					needRewrite = listEl !== component;
				}

				arr.push(needRewrite ? component : listEl);
			}

			if (needRewrite) {
				Object.defineProperty($refs, key, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: arr
				});
			}

		} else {
			let
				component,
				needRewrite = false;

			if (el instanceof Node) {
				component = (<ComponentElement>el).component;
				needRewrite = Boolean(component) && component.$el === el;

			} else {
				const {$el} = <ComponentInterface>el;
				component = $el.component;
				needRewrite = el !== component;
			}

			if (needRewrite) {
				Object.defineProperty($refs, key, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: component
				});
			}
		}
	}

	if ($refHandlers) {
		for (let keys = Object.keys($refHandlers), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				watchers = $refHandlers[key],
				el = $refs[key];

			if (el && watchers) {
				for (let i = 0; i < watchers.length; i++) {
					watchers[i](el);
				}

				delete $refHandlers[key];
			}
		}
	}
}
