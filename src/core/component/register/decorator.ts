/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import { identity } from 'core/functools';

// @ts-ignore (ss import)
import * as defTpls from 'core/block.ss';
import * as c from 'core/component/const';

import { createMeta, fillMeta } from 'core/component/meta';
import { getInfoFromConstructor } from 'core/component/reflection';

import { getComponent, ComponentDriver } from 'core/component/engines';
import { registerParentComponents } from 'core/component/register/helpers';

import { ComponentOptions, ComponentMethod } from 'core/component/interface';

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
				meta = createMeta(componentInfo);

			if (componentInfo.params.name == null || !componentInfo.isSmart) {
				c.components.set(target, meta);
			}

			c.components.set(componentInfo.name, meta);
			c.initEmitter.emit(`constructor.${componentInfo.name}`, {meta, parentMeta});

			if (componentInfo.isAbstract || meta.params.functional === true) {
				fillMeta(meta, target);
				return;
			}

			const
				componentDecl = getComponent(meta);

			if (componentInfo.params.root) {
				c.rootComponents[componentInfo.name] = new Promise(loadTemplate(componentDecl));

			} else {
				const
					c = ComponentDriver.component(componentInfo.name, loadTemplate(componentDecl, true)(identity));

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}

			// Function that waits till a component template is loaded
			function loadTemplate(component: object, dryRun: boolean = false): (resolve: Function) => any {
				return promiseCb;

				function promiseCb(resolve: Function) {
					const
						{methods, methods: {render}} = meta;

					const addRenderAndResolve = (tpls) => {
						const fns = c.componentTemplates[componentInfo.name] ?? tpls.index();
						c.componentTemplates[componentInfo.name] = fns;

						// We need to add some meta properties, like, watchers,
						// because we also register render methods to a component meta object
						const renderObj = <ComponentMethod>{
							wrapper: true,
							watchers: {},
							hooks: {},
							fn: fns.render
						};

						// @ts-ignore (access)
						// eslint-disable-next-line no-multi-assign
						const staticRenderFns = component.staticRenderFns =
							fns.staticRenderFns ?? [];

						meta.component.staticRenderFns = staticRenderFns;
						methods.render = renderObj;

						return resolve(component);
					};

					// In this case, we don't automatically attaches a render function
					if (componentInfo.params.tpl === false) {
						// We have a custom render function
						if (render && !render.wrapper) {
							return resolve(component);
						}

						// Loopback render function
						return addRenderAndResolve(defTpls.block);
					}

					// Dirty check of a component template loading status
					const f = () => {
						const
							fns = TPLS[meta.componentName];

						if (fns) {
							if (render && !render.wrapper) {
								return resolve(component);
							}

							return addRenderAndResolve(fns);
						}

						if (dryRun) {
							return promiseCb;
						}

						requestIdleCallback(f, {timeout: 50});
					};

					return f();
				}
			}
		}
	};
}
