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

import { getComponentContext } from 'core/component/context';
import type { ComponentElement, ComponentInterface } from 'core/component/interface';

/**
 * Resolves references from the specified component instance.
 *
 * This function replaces refs from component DOM nodes to component instances.
 * Also, this function fires events of ref appearances.
 *
 * @param component
 */
export function resolveRefs(component: ComponentInterface): void {
	const
		{$refs, $refHandlers} = component.unsafe;

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if ($refs == null) {
		return;
	}

	for (let keys = Object.keys($refs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			ref = $refs[key];

		if (ref == null) {
			continue;
		}

		if (Object.isArray(ref)) {
			const
				refList: unknown[] = [];

			let
				needRewrite = false;

			for (let i = 0; i < ref.length; i++) {
				const
					nestedRef = ref[i];

				let
					component;

				if (nestedRef instanceof Node) {
					component = (<ComponentElement>nestedRef).component;
					needRewrite = Boolean(component) && component.$el === nestedRef;

				} else {
					const {$el} = <ComponentInterface>nestedRef;
					component = $el?.component;
					needRewrite = nestedRef !== component;
				}

				let
					newRef = needRewrite ? component : nestedRef;

				if (!(newRef instanceof Node)) {
					needRewrite = true;
					newRef = getComponentContext(newRef);
				}

				refList.push(newRef);
			}

			if (needRewrite) {
				Object.defineProperty($refs, key, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: refList
				});
			}

		} else {
			let
				component,
				needRewrite = false;

			if (ref instanceof Node) {
				component = (<ComponentElement>ref).component;
				needRewrite = Boolean(component) && component.$el === ref;

			} else {
				const {$el} = <ComponentInterface>ref;
				component = $el?.component;
				needRewrite = ref !== component;
			}

			let
				newRef = needRewrite ? component : ref;

			if (!(newRef instanceof Node)) {
				needRewrite = true;
				newRef = getComponentContext(newRef);
			}

			if (needRewrite) {
				Object.defineProperty($refs, key, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: newRef
				});
			}
		}
	}

	if (Object.isDictionary($refHandlers)) {
		for (let keys = Object.keys($refHandlers), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				watchers = $refHandlers[key],
				ref = $refs[key];

			if (ref != null && watchers != null) {
				for (let i = 0; i < watchers.length; i++) {
					watchers[i](ref);
				}

				delete $refHandlers[key];
			}
		}
	}
}
