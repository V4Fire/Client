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

	attachTemplatesToMeta

} from 'core/component/meta';

import { initEmitter } from 'core/component/event';
import { getComponent, ComponentEngine } from 'core/component/engines';

import { getComponentMods, getInfoFromConstructor } from 'core/component/reflect';
import { registerComponent, registerParentComponents } from 'core/component/init';

import { registeredComponent } from 'core/component/decorators/const';

import type { ComponentConstructor, ComponentOptions } from 'core/component/interface';

const OVERRIDDEN = Symbol('This class is overridden in the child layer');

const HAS_NATIVE_IDLE = requestIdleCallback.toString().includes('[native code]');

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
		if (registeredComponent.event == null) {
			return;
		}

		const regComponentEvent = registeredComponent.event;

		const
			componentInfo = getInfoFromConstructor(target, opts),
			componentParams = componentInfo.params,
			isPartial = componentParams.partial != null;

		const
			componentFullName = componentInfo.name,
			componentNormalizedName = componentInfo.componentName,
			isParentLayerOverride = !isPartial && componentFullName === componentInfo.parentParams?.name;

		if (isParentLayerOverride) {
			Object.defineProperty(componentInfo.parent, OVERRIDDEN, {value: true});
		}

		if (isPartial) {
			pushToInitList(() => {
				// Partial classes reuse the same metaobject
				let meta = components.get(componentFullName);

				if (meta == null) {
					meta = createMeta(componentInfo);
					components.set(componentFullName, meta);
				}
			});

			return;
		}

		pushToInitList(regComponent);

		const needRegisterImmediate =
			componentInfo.isAbstract ||
			componentParams.root === true ||
			!Object.isTruly(componentFullName);

		if (needRegisterImmediate) {
			registerComponent(componentFullName);

		} else if (HAS_NATIVE_IDLE) {
			requestIdleCallback(registerComponent.bind(null, componentFullName));
		}

		// If we have a smart component,
		// we need to compile two components at runtime
		if (!componentInfo.isAbstract && Object.isPlainObject(componentParams.functional)) {
			component({
				...opts,
				name: `${componentFullName}-functional`,
				functional: true
			})(target);
		}

		function regComponent() {
			registerParentComponents(componentInfo);

			// The metaobject might have already been created by partial classes or in the case of a smart component
			let rawMeta = !isParentLayerOverride ? components.get(componentNormalizedName) : null;

			// If the metaobject has not been created, it should be created now
			if (rawMeta == null) {
				rawMeta = createMeta(componentInfo);
				components.set(componentNormalizedName, rawMeta);

			// If the metaobject has already been created, we create its shallow copy with some fields overridden.
			// This is necessary because smart components use the same metaobject.
			} else {
				const hasNewTarget = target !== rawMeta.constructor;

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
						value: hasNewTarget ? getComponentMods(componentInfo) : rawMeta.mods
					},

					params: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: componentInfo.params
					},

					name: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: componentInfo.name
					},

					component: {
						configurable: true,
						enumerable: true,
						writable: true,
						value: Object.create(rawMeta.component, {
							name: {
								configurable: true,
								enumerable: true,
								writable: true,
								value: componentInfo.name
							}
						})
					}
				});

				if (rawMeta != null && componentInfo.parentMeta != null) {
					inheritParams(rawMeta, componentInfo.parentMeta);

					if (hasNewTarget) {
						inheritMods(rawMeta, componentInfo.parentMeta);
					}
				}
			}

			const meta = rawMeta!;
			components.set(componentFullName, meta);

			if (componentParams.name == null || !componentInfo.isSmart) {
				components.set(target, meta);
			}

			initEmitter.emit(regComponentEvent, {
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
				rootComponents[componentFullName] = loadTemplate(getComponent(meta));

			} else {
				const componentDeclArgs = <const>[componentFullName, loadTemplate(getComponent(meta))];
				ComponentEngine.component(...componentDeclArgs);

				if (app.context != null && app.context.component(componentFullName) == null) {
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
			const initList = componentRegInitializers[componentFullName] ?? [];
			componentRegInitializers[componentFullName] = initList;
			initList.push(init);
		}
	};
}
