/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	ComponentEngine,
	DirectiveFunction,
	DirectiveOptions,
	VNode

} from '~/core/component/engines/engine';

const addDirective = ComponentEngine.directive.bind(ComponentEngine);

/**
 * A wrapped version of the `ComponentEngine.directive` function with providing of hooks for non-regular components
 *
 * @param name
 * @param params
 */
ComponentEngine.directive = function directive(name: string, params?: DirectiveOptions | DirectiveFunction) {
	if (Object.isFunction(params)) {
		return addDirective(name, params);
	}

	const
		originalBind = params?.bind,
		originalUnbind = params?.unbind;

	if (originalUnbind == null) {
		return addDirective(name, params);
	}

	return addDirective(name, {
		...params,

		bind(_el: HTMLElement, _opts: DirectiveOptions, vnode: VNode) {
			const
				args = Array.from(arguments);

			if (Object.isFunction(originalBind)) {
				originalBind.apply(this, args);
			}

			if (vnode.fakeContext != null) {
				vnode.fakeContext.unsafe.$on('component-hook:before-destroy', () => {
					originalUnbind.apply(this, args);
				});
			}
		}
	});
};
