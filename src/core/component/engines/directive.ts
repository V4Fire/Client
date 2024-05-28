/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentEngine } from 'core/component/engines/engine';
import type { Directive, DirectiveBinding, VNode } from 'core/component/engines/interface';

// eslint-disable-next-line @v4fire/unbound-method
const staticDirective = ComponentEngine.directive.length > 0 ? ComponentEngine.directive : null;

/**
 * A wrapped version of the `ComponentEngine.directive` function, providing hooks for functional components
 *
 * @param name
 * @param [directive]
 * @throws {ReferenceError} if the used component engine is not specified
 */
ComponentEngine.directive = function directive(name: string, directive?: Directive) {
	const
		ctx = Object.getPrototypeOf(this),
		originalDirective = staticDirective ?? ctx.directive;

	if (originalDirective == null) {
		throw new ReferenceError("The function to register directives isn't found");
	}

	if (directive == null) {
		return originalDirective.call(ctx, name);
	}

	if (Object.isFunction(directive)) {
		return originalDirective.call(ctx, name, directive);
	}

	if (directive.beforeCreate != null) {
		const directiveCtx = Object.assign(Object.create(directive), {directive: originalDirective});
		directive.beforeCreate = directive.beforeCreate.bind(directiveCtx);
	}

	const
		originalCreated = directive.created,
		originalUnmounted = directive.unmounted;

	if (originalUnmounted == null) {
		return originalDirective.call(ctx, name, directive);
	}

	return originalDirective.call(ctx, name, {
		...directive,

		created(_el: Element, _opts: DirectiveBinding, vnode: VNode) {
			const args = Object.cast<Parameters<NonNullable<typeof originalCreated>>>(
				// eslint-disable-next-line prefer-rest-params
				Array.from(arguments)
			);

			if (Object.isFunction(originalCreated)) {
				originalCreated.apply(this, args);
			}

			if (vnode.virtualContext != null) {
				vnode.virtualContext.unsafe.$once('[[BEFORE_DESTROY]]', () => {
					originalUnmounted.apply(this, args);
				});
			}
		}
	});
};
