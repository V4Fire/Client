/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentEngine, Directive, DirectiveBinding, VNode } from 'core/component/engines/engine';

let originalDirective = ComponentEngine.directive.length > 0 ?
	ComponentEngine.directive.bind(ComponentEngine) :
	null;

/**
 * A wrapped version of the `ComponentEngine.directive` function with providing of hooks for non-regular components
 *
 * @param name
 * @param [directive]
 */
ComponentEngine.directive = function directive(name: string, directive?: Directive) {
	if (originalDirective == null) {
		const ctx = Object.getPrototypeOf(this);
		originalDirective = ctx.directive.bind(ctx);
	}

	if (directive == null || Object.isFunction(directive)) {
		return originalDirective(name, directive);
	}

	const
		originalCreated = directive.created,
		originalUnmounted = directive.unmounted;

	if (originalUnmounted == null) {
		return originalDirective(name, directive);
	}

	return originalDirective(name, {
		...directive,

		created(_el: Element, _opts: DirectiveBinding, vnode: VNode) {
			const
				// eslint-disable-next-line prefer-rest-params
				args = Array.from(arguments);

			if (Object.isFunction(originalCreated)) {
				originalCreated.apply(this, args);
			}

			if (vnode.fakeContext != null) {
				vnode.fakeContext.unsafe.$on('component-hook:before-destroy', () => {
					originalUnmounted.apply(this, args);
				});
			}
		}
	});
};
