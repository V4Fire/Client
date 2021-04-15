/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { identity } from 'core/functools';

import * as c from 'core/component/const';

import { createMeta, fillMeta, attachTemplatesToMeta } from 'core/component/meta';
import { getInfoFromConstructor } from 'core/component/reflection';

import { getComponent, ComponentEngine } from 'core/component/engines';
import { registerParentComponents } from 'core/component/register/helpers';

import type { ComponentOptions } from 'core/component/interface';

/**
 * Registers a new component
 *
 * @decorator
 * @param [opts] - additional options
 *
 * @example
 * ```js
 * @component()
 * class Button {
 *
 * }
 * ```
 */
export function component(opts?: ComponentOptions): Function {
	return (target) => {
		const
			componentInfo = getInfoFromConstructor(target, opts),
			componentParams = componentInfo.params;

		c.initEmitter
			.emit('bindConstructor', componentInfo.name);

		if (!Object.isTruly(componentInfo.name) || componentParams.root || componentInfo.isAbstract) {
			regComponent();

		} else {
			const initList = c.componentInitializers[componentInfo.name] ?? [];
			c.componentInitializers[componentInfo.name] = initList;
			initList.push(regComponent);
		}

		// If we have a smart component,
		// we need to compile 2 components in the runtime
		if (Object.isPlainObject(componentParams.functional)) {
			component({
				...opts,
				name: `${componentInfo.name}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
			// Lazy initializing of parent components
			registerParentComponents(componentInfo);

			const
				{parentMeta} = componentInfo;

			const
				meta = createMeta(componentInfo),
				componentName = componentInfo.name;

			if (componentInfo.params.name == null || !componentInfo.isSmart) {
				c.components.set(target, meta);
			}

			c.components.set(componentName, meta);
			c.initEmitter.emit(`constructor.${componentName}`, {meta, parentMeta});

			if (componentInfo.isAbstract || meta.params.functional === true) {
				fillMeta(meta, target);

				if (!componentInfo.isAbstract) {
					loadTemplate(meta.component, true)(identity);
				}

			} else if (meta.params.root) {
				c.rootComponents[componentName] = new Promise(loadTemplate(getComponent(meta)));

			} else {
				const
					c = ComponentEngine.component(componentName, loadTemplate(getComponent(meta), true)(identity));

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}

			// Function that waits till a component template is loaded
			function loadTemplate(component: object, dryRun: boolean = false): (resolve: Function) => any {
				return promiseCb;

				function promiseCb(resolve: Function) {
					if (meta.params.tpl === false) {
						return attachTemplatesAndResolve();
					}

					return waitComponentTemplates();

					function waitComponentTemplates() {
						const
							fns = TPLS[meta.componentName];

						if (fns) {
							return attachTemplatesAndResolve(fns);
						}

						if (dryRun) {
							return promiseCb;
						}

						requestIdleCallback(waitComponentTemplates, {timeout: 50});
					}

					function attachTemplatesAndResolve(tpls?: Dictionary) {
						attachTemplatesToMeta(meta, tpls);

						// @ts-ignore (access)
						component.staticRenderFns = meta.component.staticRenderFns;

						return resolve(component);
					}
				}
			}
		}
	};
}
