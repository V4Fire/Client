/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/directives/attrs/README.md]]
 * @packageDocumentation
 */

import { components } from 'core/component/const';
import { isPropGetter } from 'core/component/reflect';
import { ComponentEngine, DirectiveBinding, VNode } from 'core/component/engines';

import { normalizeComponentAttrs } from 'core/component/render';
import { getDirectiveContext, patchVnodeEventListener } from 'core/component/directives/helpers';

import {

	directiveRgxp,

	handlers

} from 'core/component/directives/attrs/const';

import {

	patchProps,
	normalizePropertyAttribute,
	normalizeDirectiveModifiers

} from 'core/component/directives/attrs/helpers';

import type { ComponentInterface } from 'core/component/interface';
import type { DirectiveParams } from 'core/component/directives/attrs/interface';

//#if runtime has dummyComponents
import('core/component/directives/attrs/test/b-component-directives-attrs-dummy');
//#endif

export * from 'core/component/directives/attrs/const';
export * from 'core/component/directives/attrs/interface';

ComponentEngine.directive('attrs', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		const
			ctx = getDirectiveContext(params, vnode),
			resolveDirective = this.directive.bind(this);

		const
			componentCtx = vnode.virtualComponent?.unsafe,
			componentMeta = Object.isDictionary(vnode.type) ? components.get(vnode.type['name']) : componentCtx?.meta;

		const props = vnode.props ?? {};
		vnode.props ??= props;

		let
			r: CanUndef<ComponentInterface['$renderEngine']['r']>,
			handlerStore: CanUndef<Map<unknown, Function>>;

		if (ctx != null) {
			r = ctx.$renderEngine.r;
		}

		let attrs = {...params.value};

		if (componentMeta != null) {
			attrs = normalizeComponentAttrs(attrs, vnode.dynamicProps, componentMeta)!;
		}

		const attrsKeys = Object
			.keys(attrs)
			.sort(((key) => key.startsWith('v-') ? 1 : -1));

		for (let i = 0; i < attrsKeys.length; i++) {
			const
				attrName = attrsKeys[i],
				attrVal = attrs[attrName];

			if (attrName.startsWith('v-')) {
				parseDirective(attrName, attrVal);

			} else if (attrName.startsWith('@')) {
				patchVnodeEventListener(ctx, vnode, props, attrName, attrVal);

			} else {
				parseProperty(attrName, attrVal);
			}
		}

		function parseProperty(attrName: string, attrVal: unknown) {
			attrName = normalizePropertyAttribute(attrName);

			const needPatchVNode =
				componentCtx == null ||
				componentMeta?.props[attrName] == null;

			if (needPatchVNode) {
				patchProps(props, attrName, attrVal, vnode);

			} else {
				Object.defineProperty(componentCtx, attrName, {
					configurable: true,
					enumerable: true,
					writable: true,
					value: attrVal
				});
			}
		}

		function parseDirective(attrName: string, attrVal: unknown) {
			const decl = directiveRgxp.exec(attrName);

			let value = attrVal;

			if (decl == null) {
				throw new SyntaxError('Invalid directive declaration');
			}

			const [, name, arg = '', rawModifiers = ''] = decl;

			let dir: CanUndef<object>;

			switch (name) {
				case 'show': {
					dir = r?.vShow;
					break;
				}

				case 'on': {
					if (Object.isDictionary(value)) {
						for (const name of Object.keys(value)) {
							attachEvent(name, value[name]);
						}
					}

					return;
				}

				case 'bind': {
					if (Object.isDictionary(value)) {
						for (const name of Object.keys(value)) {
							attrs[name] = value[name];
							attrsKeys.push(name);
						}
					}

					return;
				}

				case 'model': {
					const
						modelProp = arg !== '' ? arg : 'modelValue',
						modelValLink = String(value);

					const
						handlerCache = getHandlerStore(),
						handlerKey = `onUpdate:${modelProp}:${modelValLink}`;

					let handler = handlerCache.get(handlerKey);

					if (handler == null) {
						handler = (newVal: unknown) => {
							if (ctx == null) {
								throw new Error('No context found for the directive being created');
							}

							ctx[modelValLink] = newVal;
						};

						handlerCache.set(handlerKey, handler);
					}

					value = ctx?.[modelValLink];

					attrsKeys.push(modelProp);
					attrs[modelProp] = value;

					switch (vnode.type) {
						case 'input':
						case 'textarea':
						case 'select': {
							dir = r?.vModelDynamic;
							attachEvent('update:modelValue', handler);
							break;
						}

						default: {
							attachEvent(`onUpdate:${modelProp}`, handler);
							return;
						}
					}

					break;
				}

				default:
					dir = resolveDirective(name);
			}

			if (dir == null) {
				throw new ReferenceError(`The specified directive "${name}" is not registered`);
			}

			const modifiers = normalizeDirectiveModifiers(rawModifiers);

			const bindings = vnode.dirs ?? [];
			vnode.dirs = bindings;

			const binding: DirectiveBinding = {
				dir: Object.isFunction(dir) ? {created: dir, mounted: dir} : dir,
				instance: params.instance,

				value,
				oldValue: undefined,

				arg,
				modifiers
			};

			const cantIgnoreDir = value != null || decl.length !== 2;

			if (Object.isDictionary(dir)) {
				if (Object.isFunction(dir.beforeCreate)) {
					const newVnode = dir.beforeCreate(binding, vnode);

					if (newVnode != null) {
						vnode = newVnode;
					}

					if (Object.keys(dir).length > 1 && cantIgnoreDir) {
						bindings.push(binding);
					}

				} else if (Object.keys(dir).length > 0 && cantIgnoreDir) {
					bindings.push(binding);
				}

			} else if (cantIgnoreDir) {
				bindings.push(binding);
			}
		}

		function attachEvent(event: string, handler: unknown) {
			event = `@${event}`;
			attrsKeys.push(event);
			attrs[event] = handler;
		}

		function getHandlerStore() {
			if (ctx == null) {
				throw new Error('No context found for the directive being created');
			}

			if (handlerStore != null) {
				return handlerStore;
			}

			handlerStore = handlers.get(ctx);

			if (handlerStore == null) {
				handlerStore = new Map();

				handlers.set(ctx, handlerStore);
			}

			return handlerStore;
		}
	},

	getSSRProps(params: DirectiveParams, vnode?: VNode) {
		const
			ctx = getDirectiveContext(params, null),
			r = ctx?.$renderEngine.r;

		const
			props: Dictionary = vnode?.props ?? {},
			componentMeta = ctx?.meta;

		let attrs = {...params.value};

		if (vnode != null) {
			vnode.props ??= props;
		}

		if (componentMeta != null) {
			attrs = normalizeComponentAttrs(attrs, null, componentMeta)!;
		}

		for (const name of Object.keys(attrs)) {
			const value = attrs[name];

			if (name.startsWith('v-')) {
				parseDirective(name, value);

			} else if (!name.startsWith('@') || isPropGetter.test(name)) {
				patchProps(props, normalizePropertyAttribute(name), value);
			}
		}

		return props;

		function parseDirective(attrName: string, attrVal: unknown) {
			const decl = directiveRgxp.exec(attrName);

			if (decl == null) {
				throw new SyntaxError('Invalid directive declaration');
			}

			const [, name, arg = '', rawModifiers = ''] = decl;

			let dir: CanUndef<object>;

			switch (name) {
				case 'show': {
					dir = r?.vShow;
					break;
				}

				case 'bind': {
					if (Object.isDictionary(attrVal)) {
						for (const name of Object.keys(attrVal)) {
							props[name] = attrVal[name];
						}
					}

					return;
				}

				default:
					dir = r?.resolveDirective.call(ctx, name);
			}

			if (dir == null) {
				throw new ReferenceError(`The specified directive "${name}" is not registered`);
			}

			const modifiers = normalizeDirectiveModifiers(rawModifiers);

			const binding: DirectiveBinding = {
				dir,
				instance: params.instance,

				value: attrVal,
				oldValue: undefined,

				arg,
				modifiers
			};

			if (Object.isDictionary(dir) && Object.isFunction(dir.getSSRProps)) {
				const dirProps = dir.getSSRProps(binding);
				Object.mixin({deep: true}, props, dirProps);
			}
		}
	}
});
