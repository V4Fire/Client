/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { createComponentDecorator, normalizeFunctionalParams } from 'core/component/decorators/helpers';

import type { ComponentMethod } from 'core/component/interface';

import type { PartDecorator } from 'core/component/decorators/interface';

import type { DecoratorHook } from 'core/component/decorators/hook/interface';

/**
 * Attaches a hook listener to a component method.
 * This means that when the component switches to the specified hook(s), the method will be called.
 *
 * @decorator
 * @param [hook] - the hook name, an array of hooks, or an object with hook parameters
 *
 * @example
 * ```typescript
 * import iBlock, { component, hook } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @hook('mounted')
 *   onMounted() {
 *
 *   }
 * }
 * ```
 */
export function hook(hook: DecoratorHook): PartDecorator {
	return createComponentDecorator(({meta}, key, desc) => {
		if (desc == null) {
			return;
		}

		const methodHooks = Array.toArray(hook);

		const method: ComponentMethod = meta.methods[key] ?? {
			src: meta.componentName,
			fn: Object.throw,
			hooks: {}
		};

		const {hooks = {}} = method;

		for (const hook of methodHooks) {
			if (Object.isSimpleObject(hook)) {
				const
					hookName = Object.keys(hook)[0],
					hookParams = hook[hookName];

				hooks[hookName] = normalizeFunctionalParams({
					...hookParams,
					name: key,
					hook: hookName,
					after: hookParams.after != null ? new Set(Array.toArray(hookParams.after)) : undefined
				}, meta);

			} else {
				hooks[hook] = normalizeFunctionalParams({name: key, hook}, meta);
			}
		}

		meta.methods[key] = normalizeFunctionalParams({...method}, meta);
	});
}
