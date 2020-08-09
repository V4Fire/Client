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
		const componentInfo = getInfoFromConstructor(target, opts);
		c.initEmitter.emit('bindConstructor', componentInfo.name);

		if (!Object.isTruly(componentInfo.name) || componentInfo.params.root || componentInfo.isAbstract) {
			regComponent();

		} else {
			const initList = c.componentInitializers[componentInfo.name] ?? [];
			c.componentInitializers[componentInfo.name] = initList;
			initList.push(regComponent);
		}

		// If we have a smart component,
		// we need to compile 2 components in the runtime
		if (Object.isPlainObject(componentInfo.params.functional)) {
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

			if (componentInfo.isAbstract) {
				fillMeta(meta, target);
				return;
			}

			// Function that waits till a component template is loaded
			const loadTemplate = (component, dryRun = false) => {
				const promiseCb = (resolve) => {
					const success = () => {
						log(`component:load:${componentInfo.name}`, component);
						return resolve(component);
					};

					const
						{methods, methods: {render}} = meta;

					const addRenderAndResolve = (tpls) => {
						const fns = c.componentTemplates[componentInfo.name] ?? tpls.index();
						c.componentTemplates[componentInfo.name] = fns;

						// We need to add some meta properties, like, watchers,
						// because we also register render methods to a component meta object
						const renderObj = <ComponentMethod>{wrapper: true, watchers: {}, hooks: {}};

						renderObj.fn = fns.render;
						component.staticRenderFns = fns.staticRenderFns ?? [];
						meta.component.staticRenderFns = component.staticRenderFns;

						methods.render = renderObj;
						return success();
					};

					// In this case, we don't automatically attaches a render function
					if (componentInfo.params.tpl === false) {
						// We have a custom render function
						if (render && !render.wrapper) {
							return success();
						}

						// Loopback render function
						return addRenderAndResolve(defTpls.block);
					}

					let
						i = 0;

					// Dirty check of a component template loading status
					const f = () => {
						const
							fns = TPLS[meta.componentName];

						if (fns) {
							if (render && !render.wrapper) {
								return success();
							}

							return addRenderAndResolve(fns);
						}

						if (dryRun) {
							return promiseCb;
						}

						// First 15 times we use "fast" setImmediate strategy,
						// but after, we start to throttle
						if (i < 15) {
							i++;

							globalThis['setImmediate'](f);

						} else {
							setTimeout(f, 100);
						}
					};

					return f();
				};

				return promiseCb;
			};

			const
				component = getComponent(meta);

			if (componentInfo.params.root) {
				c.rootComponents[componentInfo.name] = new Promise(loadTemplate(component));

			} else {
				const
					c = ComponentDriver.component(componentInfo.name, loadTemplate(component, true)(identity));

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}
		}
	};
}
