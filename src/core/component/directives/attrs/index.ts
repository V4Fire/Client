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
import { propGetterRgxp } from 'core/component/reflect';
import { ComponentEngine, DirectiveBinding, VNode } from 'core/component/engines';

import { setVNodePatchFlags, normalizeComponentAttrs } from 'core/component/render';
import { getDirectiveContext } from 'core/component/directives/helpers';

import {

	directiveRgxp,

	handlers,
	modifiers,
	keyModifiers

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

		let
			attrs = {...params.value};

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
				parseEventListener(attrName, attrVal);

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
			const
				decl = directiveRgxp.exec(attrName);

			let
				value = attrVal;

			if (decl == null) {
				throw new SyntaxError('Invalid directive declaration');
			}

			const
				[, name, arg = '', rawModifiers = ''] = decl;

			let
				dir: CanUndef<object>;

			switch (name) {
				case 'show': {
					dir = r?.vShow;
					break;
				}

				case 'on': {
					if (Object.isDictionary(value)) {
						Object.entries(value).forEach(([name, handler]) => {
							attachEvent(name, handler);
						});
					}

					return;
				}

				case 'bind': {
					if (Object.isDictionary(value)) {
						Object.entries(value).forEach(([name, val]) => {
							attrs[name] = val;
							attrsKeys.push(name);
						});
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

					let
						handler = handlerCache.get(handlerKey);

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
					const
						newVnode = dir.beforeCreate(binding, vnode);

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

		function parseEventListener(attrName: string, attrVal: unknown) {
			let event = attrName.slice(1).camelize(false);

			const
				eventChunks = event.split('.'),
				flags = Object.createDict<boolean>();

			// The first element is the event name; we need to slice only the part containing the event modifiers
			eventChunks.slice(1).forEach((chunk) => flags[chunk] = true);
			event = eventChunks[0];

			if (flags.right && !event.startsWith('key')) {
				event = 'onContextmenu';
				delete flags.right;

			} else if (flags.middle && event !== 'mousedown') {
				event = 'onMouseup';

			} else {
				event = `on${event.capitalize()}`;
			}

			if (flags.capture) {
				event += 'Capture';
				delete flags.capture;
			}

			if (flags.once) {
				event += 'Once';
				delete flags.once;
			}

			if (flags.passive) {
				event += 'Passive';
				delete flags.passive;
			}

			if (Object.keys(flags).length > 0) {
				const
					registeredModifiers = Object.keys(Object.select(flags, modifiers)),
					registeredKeyModifiers = Object.keys(Object.select(flags, keyModifiers));

				if (registeredModifiers.length > 0) {
					attrVal = r?.withModifiers.call(ctx, Object.cast(attrVal), registeredKeyModifiers);
				}

				if (registeredKeyModifiers.length > 0) {
					attrVal = r?.withKeys.call(ctx, Object.cast(attrVal), registeredKeyModifiers);
				}
			}

			// For the transmission of accessors, `forceUpdate: false` props use events.
			// For example, `@:value = createPropAccessors(() => someValue)`.
			// A distinctive feature of such events is the prefix `@:` or `on:`.
			// Such events are processed in a special way.
			const isSystemGetter = propGetterRgxp.test(event);
			props[event] = attrVal;

			if (!isSystemGetter) {
				setVNodePatchFlags(vnode, 'events');

				const dynamicProps = vnode.dynamicProps ?? [];
				vnode.dynamicProps = dynamicProps;
				dynamicProps.push(event);
			}
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

	getSSRProps(params: DirectiveParams) {
		const
			ctx = getDirectiveContext(params, null),
			r = ctx?.$renderEngine.r;

		const
			props: Dictionary = {},
			componentMeta = ctx?.meta;

		let
			attrs = {...params.value};

		if (componentMeta != null) {
			attrs = normalizeComponentAttrs(attrs, null, componentMeta)!;
		}

		Object.entries(attrs).forEach(([name, value]) => {
			if (name.startsWith('v-')) {
				parseDirective(name, value);

			} else if (!name.startsWith('@')) {
				patchProps(props, normalizePropertyAttribute(name), value);
			}
		});

		return props;

		function parseDirective(attrName: string, attrVal: unknown) {
			const
				decl = directiveRgxp.exec(attrName);

			if (decl == null) {
				throw new SyntaxError('Invalid directive declaration');
			}

			const
				[, name, arg = '', rawModifiers = ''] = decl;

			let
				dir: CanUndef<object>;

			switch (name) {
				case 'show': {
					dir = r?.vShow;
					break;
				}

				case 'bind': {
					if (Object.isDictionary(attrVal)) {
						Object.entries(attrVal).forEach(([name, val]) => {
							props[name] = val;
						});
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
