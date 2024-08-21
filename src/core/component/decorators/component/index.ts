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

import {

	createMeta,
	fillMeta,

	inheritMods,
	inheritParams,

	attachTemplatesToMeta,
	addMethodsToMeta

} from 'core/component/meta';

import { initEmitter } from 'core/component/event';
import { getComponent, ComponentEngine } from 'core/component/engines';

import { getComponentMods, getInfoFromConstructor } from 'core/component/reflect';
import { registerComponent, registerParentComponents } from 'core/component/init';

import type { ComponentConstructor, ComponentOptions } from 'core/component/interface';

const OVERRIDDEN = Symbol('This class is overridden in the child layer');

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
			isPartial = componentParams.partial != null;

		const
			componentOriginName = componentInfo.name,
			componentNormalizedName = componentInfo.componentName,
			hasSameOrigin = !isPartial && componentOriginName === componentInfo.parentParams?.name;

		if (hasSameOrigin) {
			Object.defineProperty(componentInfo.parent, OVERRIDDEN, {value: true});
		}

		initEmitter.emit('bindConstructor', componentOriginName);

		if (isPartial) {
			pushToInitList(() => {
				let meta = components.get(componentOriginName);

				if (meta == null) {
					meta = createMeta(componentInfo);
					components.set(componentOriginName, meta);
				}

				initEmitter.once(`constructor.${componentOriginName}`, () => {
					addMethodsToMeta(components.get(componentOriginName)!, target);
				});
			});

			return;
		}

		pushToInitList(regComponent);

		const needRegisterImmediate =
			componentInfo.isAbstract ||
			componentParams.root === true ||
			!Object.isTruly(componentOriginName);

		if (needRegisterImmediate) {
			registerComponent(componentOriginName);

		} else {
			requestIdleCallback(registerComponent.bind(null, componentOriginName));
		}

		// If we have a smart component,
		// we need to compile two components at runtime
		if (Object.isPlainObject(componentParams.functional)) {
			component({
				...opts,
				name: `${componentOriginName}-functional`,
				functional: true
			})(target);
		}

		function regComponent() {
			registerParentComponents(componentInfo);

			let rawMeta = components.get(componentNormalizedName);

			if (rawMeta == null) {
				rawMeta = createMeta(componentInfo);
				components.set(componentNormalizedName, rawMeta);

			} else {
				const newTarget = target !== rawMeta.constructor;

				rawMeta = Object.create(rawMeta, {
					constructor: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: target
					},

					mods: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: newTarget ? getComponentMods(componentInfo) : rawMeta.mods
					},

					params: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: componentInfo.params
					}
				});

				if (rawMeta != null && componentInfo.parentMeta != null) {
					inheritParams(rawMeta, componentInfo.parentMeta);

					if (newTarget) {
						inheritMods(rawMeta, componentInfo.parentMeta);
					}
				}
			}

			const meta = rawMeta!;
			components.set(componentOriginName, meta);

			if (componentParams.name == null || !componentInfo.isSmart) {
				components.set(target, meta);
			}

			initEmitter.emit(`constructor.${componentNormalizedName}`, {
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
				rootComponents[componentOriginName] = loadTemplate(getComponent(meta));

			} else {
				const componentDeclArgs = <const>[componentOriginName, loadTemplate(getComponent(meta))];
				ComponentEngine.component(...componentDeclArgs);

				if (app.context != null && app.context.component(componentOriginName) == null) {
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

		function pushToInitList(init: Function) {
			const initList = componentRegInitializers[componentOriginName] ?? [];
			componentRegInitializers[componentOriginName] = initList;
			initList.push(init);
		}
	};
}
