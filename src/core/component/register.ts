/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-ignore
import * as defTpls from 'core/block.ss';
import log from 'core/log';

import * as c from 'core/component/const';
import { getBlankMetaForComponent } from 'core/component/meta';
import { getInfoFromConstructor } from 'core/component/reflection';

import inheritMeta from 'core/component/create/inherit';
import { wrapRender } from 'core/component/create/render-function';

import { ComponentDriver } from 'core/component/engines';
import { getComponent, getBaseComponent } from 'core/component/create';
import { registerParentComponents } from 'core/component/create/register';

import { ComponentParams, ComponentMethod } from 'core/component/interface';

/**
 * Creates a new component
 *
 * @decorator
 * @param [declParams] - additional parameters:
 *   *) [name] - component name
 *   *) [root] - if true, then the component will be registered as root
 *   *) [tpl] - if false, then will be used the default template
 *   *) [functional] - functional status:
 *        *) if true, then the component will be created as functional
 *        *) if a table with parameters, then the component will be created as smart component
 *
 *   *) [flyweight] - if true, then the component can be used as flyweight (within a composite virtual tree)
 *   *) [parent] - link to a parent component
 *
 *   // Component driver options (by default Vue):
 *
 *   *) [model] - parameters for a model option
 *   *) [inheritAttrs] - parameters for an inheritAttrs option
 */
export function component(declParams?: ComponentParams): Function {
	return (target) => {
		const i = getInfoFromConstructor(target, declParams);
		c.initEmitter.emit('bindConstructor', i.name);

		if (!i.name || i.params.root || i.isAbstract) {
			regComponent();

		} else {
			const initList = c.componentInitializers[i.name] = c.componentInitializers[i.name] || [];
			initList.push(regComponent);
		}

		// If we have a smart component,
		// then we compile 2 components in the runtime
		if (Object.isPlainObject(i.params.functional)) {
			component({
				...declParams,
				name: `${i.name}-functional`,
				functional: true
			})(target);
		}

		function regComponent(): void {
			// Lazy initializing of parent components
			registerParentComponents(i);

			const
				parentMeta = i.parentMeta,
				meta = getBlankMetaForComponent(i);

			meta.component.render = wrapRender(meta);

			if (parentMeta) {
				i.params = inheritMeta(meta, parentMeta);
			}

			if (!i.params.name || !i.isSmart) {
				c.components.set(target, meta);
			}

			c.components.set(i.name, meta);
			c.initEmitter.emit(`constructor.${i.name}`, {meta, parentMeta});

			if (i.isAbstract) {
				getBaseComponent(target, meta);
				return;
			}

			const loadTemplate = (component) => (resolve) => {
				const success = () => {
					log(`component:load:${i.name}`, component);
					resolve(component);
				};

				const
					{methods, methods: {render: r}} = meta;

				const addRenderAndResolve = (tpls) => {
					const
						fns = c.componentTemplates[i.name] = c.componentTemplates[i.name] || tpls.index(),
						renderObj = <ComponentMethod>{wrapper: true, watchers: {}, hooks: {}};

					renderObj.fn = fns.render;
					component.staticRenderFns = meta.component.staticRenderFns = fns.staticRenderFns || [];

					methods.render = renderObj;
					success();
				};

				if (i.params.tpl === false) {
					if (r && !r.wrapper) {
						success();

					} else {
						addRenderAndResolve(defTpls.block);
					}

				} else {
					let
						i = 0;

					const f = () => {
						const
							fns = TPLS[meta.componentName];

						if (fns) {
							if (r && !r.wrapper) {
								success();

							} else {
								addRenderAndResolve(fns);
							}

						} else {
							if (i < 15) {
								i++;

								// tslint:disable-next-line:no-string-literal
								globalThis['setImmediate'](f);

							} else {
								setTimeout(f, 100);
							}
						}
					};

					f();
				}
			};

			const
				obj = loadTemplate(getComponent(target, meta));

			if (i.params.root) {
				c.rootComponents[i.name] = new Promise(obj);

			} else {
				const
					c = ComponentDriver.component(i.name, obj);

				if (Object.isPromise(c)) {
					c.catch(stderr);
				}
			}
		}
	};
}
