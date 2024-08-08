/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/component/README.md]]
 * @packageDocumentation
 */

import { identity } from 'core/functools';

import {

	app,

	components,
	rootComponents,

	componentRegInitializers

} from 'core/component/const';

import { initEmitter } from 'core/component/event';
import { createMeta, fillMeta, attachTemplatesToMeta, addMethodsToMeta } from 'core/component/meta';
import { getInfoFromConstructor } from 'core/component/reflect';

import { getComponent, ComponentEngine } from 'core/component/engines';
import { registerComponent, registerParentComponents } from 'core/component/init';

import type { ComponentConstructor, ComponentOptions } from 'core/component/interface';

const
	OVERRIDDEN = Symbol('This class is overridden');

/**
 * Registers a new component based on the tied class
 *
 * @decorator
 * @param [opts] - additional options
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop, computed } from 'components/super/i-block/i-block';
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
	return (target: ComponentConstructor) => {
		const
			componentInfo = getInfoFromConstructor(target, opts),
			componentParams = componentInfo.params,
			partOf = componentParams.partial != null;

		const
			componentName = componentInfo.name,
			hasSameName = !partOf && componentName === componentInfo.parentParams?.name;

		if (hasSameName) {
			Object.defineProperty(componentInfo.parent!, OVERRIDDEN, {value: true});
		}

		initEmitter.emit('bindConstructor', componentName);

		if (partOf) {
			let meta = components.get(componentName);

			if (meta == null) {
				meta = createMeta(componentInfo);
				components.set(componentName, meta);
			}

			addMethodsToMeta(meta, target);
			return;
		}

		if (!Object.isTruly(componentName) || componentParams.root === true || componentInfo.isAbstract) {
			regComponent();

		} else {
			const initList = componentRegInitializers[componentName] ?? [];
			componentRegInitializers[componentName] = initList;
			initList.push(regComponent);

			requestIdleCallback(() => registerComponent(componentName));
		}

		// If we have a smart component,
		// we need to compile two components at runtime
		if (Object.isPlainObject(componentParams.functional)) {
			component({
				...opts,
				name: `${componentName}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
			registerParentComponents(componentInfo);

			let rawMeta = components.get(componentName);

			if (rawMeta == null) {
				rawMeta = createMeta(componentInfo);
				components.set(componentName, rawMeta);

			} else {
				rawMeta.constructor = target;
			}

			const meta = rawMeta;

			if (componentParams.name == null || !componentInfo.isSmart) {
				components.set(target, meta);
			}

			initEmitter.emit(`constructor.${componentName}`, {
				meta,
				parentMeta: componentInfo.parentMeta
			});

			const noNeedToRegisterAsComponent =
				componentInfo.isAbstract ||
				target.hasOwnProperty(OVERRIDDEN) ||
				!SSR && meta.params.functional === true;

			if (noNeedToRegisterAsComponent) {
				fillMeta(meta, target);

				if (!componentInfo.isAbstract) {
					Promise.resolve(loadTemplate(meta.component)).catch(stderr);
				}

			} else if (meta.params.root) {
				rootComponents[componentName] = loadTemplate(getComponent(meta));

			} else {
				const componentDeclArgs = <const>[componentName, loadTemplate(getComponent(meta))];
				ComponentEngine.component(...componentDeclArgs);

				if (app.context != null && app.context.component(componentName) == null) {
					app.context.component(...componentDeclArgs);
				}
			}

			function loadTemplate(component: object): CanPromise<ComponentOptions> {
				let resolve: Function = identity;
				return meta.params.tpl === false ? attachTemplatesAndResolve() : waitComponentTemplates();

				function waitComponentTemplates() {
					const fns = TPLS[meta.componentName];

					if (fns != null) {
						return attachTemplatesAndResolve(fns);
					}

					if (SSR) {
						attachTemplatesAndResolve();
						return;
					}

					if (resolve === identity) {
						return new Promise((r) => {
							resolve = r;
							retry();
						});
					}

					retry();

					function retry() {
						requestIdleCallback(waitComponentTemplates, {timeout: 50});
					}
				}

				function attachTemplatesAndResolve(tpls?: Dictionary) {
					attachTemplatesToMeta(meta, tpls);
					return resolve(component);
				}
			}
		}
	};
}
