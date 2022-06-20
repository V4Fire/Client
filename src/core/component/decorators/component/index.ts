/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { identity } from 'core/functools';

import * as c from 'core/component/const';

import { initEmitter } from 'core/component/event';
import { createMeta, fillMeta, attachTemplatesToMeta } from 'core/component/meta';
import { getInfoFromConstructor } from 'core/component/reflect';

import { getComponent, ComponentEngine } from 'core/component/engines';
import { registerParentComponents } from 'core/component/register/helpers';

import type { ComponentOptions } from 'core/component/interface';

/**
 * Registers a new component based on the tied class
 *
 * @decorator
 * @param [opts] - additional options
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop, computed } from 'super/i-block/i-block';
 *
 * @component({functional: true})
 * export default class bUser extends iBlock {
 *   @prop(String)
 *   readonly fName: string;
 *
 *   @prop(String)
 *   readonly lName: string;
 *
 *   @computed({cache: true, dependencies: ['fName', 'lName']})
 *   get fullName() {
 *     return `${this.fName} ${this.lName}`;
 *   }
 * }
 * ```
 */
export function component(opts?: ComponentOptions): Function {
	return (target) => {
		const
			componentInfo = getInfoFromConstructor(target, opts),
			componentParams = componentInfo.params;

		initEmitter
			.emit('bindConstructor', componentInfo.name);

		if (!Object.isTruly(componentInfo.name) || componentParams.root || componentInfo.isAbstract) {
			regComponent();

		} else {
			const initList = c.componentInitializers[componentInfo.name] ?? [];
			c.componentInitializers[componentInfo.name] = initList;
			initList.push(regComponent);
		}

		// If we have a smart component,
		// we need to compile two components in the runtime
		if (Object.isPlainObject(componentParams.functional)) {
			component({
				...opts,
				name: `${componentInfo.name}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
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
			initEmitter.emit(`constructor.${componentName}`, {meta, parentMeta});

			if (componentInfo.isAbstract || meta.params.functional === true) {
				fillMeta(meta, target);

				if (!componentInfo.isAbstract) {
					loadTemplate(meta.component)(identity);
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
			function loadTemplate(component: object, lazy: boolean = false): (resolve: Function) => any {
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

						if (lazy) {
							return promiseCb;
						}

						requestIdleCallback(waitComponentTemplates, {timeout: 50});
					}

					function attachTemplatesAndResolve(tpls?: Dictionary) {
						attachTemplatesToMeta(meta, tpls);
						return resolve(component);
					}
				}
			}
		}
	};
}
