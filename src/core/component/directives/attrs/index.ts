/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable complexity */

/**
 * [[include:core/component/directives/attrs/README.md]]
 * @packageDocumentation
 */

import { components } from 'core/component/const';
import { ComponentEngine, DirectiveBinding, VNode } from 'core/component/engines';

import {

	mergeProps,
	normalizeStyle,
	normalizeClass,
	normalizeComponentAttrs,
	setVNodePatchFlags

} from 'core/component/render';

import { getDirectiveContext } from 'core/component/directives/helpers';

import {

	modRgxp,
	directiveRgxp,

	handlers,
	modifiers,
	keyModifiers,

	classAttrs,
	styleAttrs

} from 'core/component/directives/attrs/const';

import type { ComponentInterface } from 'core/component/interface';
import type { DirectiveParams } from 'core/component/directives/attrs/interface';

export * from 'core/component/directives/attrs/const';
export * from 'core/component/directives/attrs/interface';

ComponentEngine.directive('attrs', {
	beforeCreate(params: DirectiveParams, vnode: VNode): void {
		let
			handlerStore;

		const
			ctx = getDirectiveContext(params, vnode),
			componentCtx = vnode.virtualComponent?.unsafe,
			componentMeta = Object.isDictionary(vnode.type) ? components.get(vnode.type['name']) : componentCtx?.meta;

		const props = vnode.props ?? {};
		vnode.props ??= props;

		let
			attrs = {...params.value};

		if (componentMeta != null) {
			attrs = normalizeComponentAttrs(attrs, vnode.dynamicProps, componentMeta)!;
		}

		let
			r: CanUndef<ComponentInterface['$renderEngine']['r']>;

		if (ctx != null) {
			r = ctx.$renderEngine.r;
		}

		for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
			let
				attrName = keys[i],
				attrVal = attrs[attrName];

			// Directive
			if (attrName.startsWith('v-')) {
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
					dir;

				switch (name) {
					case 'show': {
						dir = r?.vShow;
						break;
					}

					case 'on': {
						if (Object.isDictionary(value)) {
							Object.entries(value).forEach(([name, handler]) => {
								const event = `@${name}`;
								attrs[event] = handler;
								keys.push(event);
							});
						}

						continue;
					}

					case 'bind': {
						if (Object.isDictionary(value)) {
							Object.entries(value).forEach(([name, val]) => {
								attrs[name] = val;
								keys.push(name);
							});
						}

						continue;
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
							handler = (newVal) => {
								if (ctx == null) {
									throw new ReferenceError('The directive context is not found');
								}

								ctx[modelValLink] = newVal;
							};

							handlerCache.set(handlerKey, handler);
						}

						value = ctx?.[modelValLink];

						keys.push(modelProp);
						attrs[modelProp] = value;

						const attachEvent = (event) => {
							keys.push(event);
							attrs[event] = handler;
						};

						switch (vnode.type) {
							case 'input':
							case 'textarea':
							case 'select': {
								dir = r?.vModelDynamic;
								attachEvent('@update:modelValue');
								break;
							}

							default: {
								attachEvent(`@onUpdate:${modelProp}`);
								continue;
							}
						}

						break;
					}

					default:
						dir = this.directive(name);
				}

				if (dir == null) {
					throw new ReferenceError(`The specified directive "${name}" is not registered`);
				}

				const modifiers = {};
				rawModifiers.split('.').forEach((modifier) => {
					modifier = modifier.trim();

					if (modifier !== '') {
						modifiers[modifier] = true;
					}
				});

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

				const
					cantIgnoreDir = value != null || decl.length !== 2;

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

				continue;
			}

			// Event listener
			if (attrName.startsWith('@')) {
				let
					isDOMEvent = true,
					event = attrName.slice(1).camelize(false);

				const
					originalEvent = event,
					eventChunks = event.split('.');

				const
					flags = Object.createDict<boolean>(),
					isOnceEvent = flags.once;

				eventChunks.forEach((chunk) => flags[chunk] = true);
				event = eventChunks[0];

				if (flags.right && !event.startsWith('key')) {
					event = 'onContextmenu';
					delete flags.right;

				} else if (flags.middle && event !== 'mousedown') {
					event = 'onMouseup';

				} else {
					event = `on${event.capitalize()}`;
					isDOMEvent = false;
				}

				if (flags.capture) {
					event += 'Capture';
					isDOMEvent = true;
					delete flags.capture;
				}

				if (flags.once) {
					event += 'Once';
					delete flags.once;
				}

				if (flags.passive) {
					event += 'Passive';
					isDOMEvent = true;
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

				if (componentCtx != null && !isDOMEvent && Object.isFunction(attrVal)) {
					if (isOnceEvent) {
						componentCtx.$on(originalEvent, attrVal);

					} else {
						componentCtx.$once(originalEvent, attrVal);
					}

				} else {
					props[event] = attrVal;
					setVNodePatchFlags(vnode, 'events');

					const dynamicProps = vnode.dynamicProps ?? [];
					vnode.dynamicProps = dynamicProps;
					dynamicProps.push(event);
				}

				continue;
			}

			// Simple property
			attrName = attrName.startsWith(':') ?
				attrName.slice(1) :
				attrName;

			if (modRgxp.test(attrName)) {
				const attrChunks = attrName.split('.');
				attrName = attrName.startsWith('.') ? `.${attrChunks[1]}` : attrChunks[0];

				if (attrChunks.includes('camel')) {
					attrName = attrName.camelize(false);
				}

				if (attrChunks.includes('prop') && !attrName.startsWith('.')) {
					if (attrName.startsWith('^')) {
						throw new SyntaxError('Invalid `v-bind` modifiers');
					}

					attrName = `.${attrName}`;
				}

				if (attrChunks.includes('attr') && !attrName.startsWith('^')) {
					if (attrName.startsWith('.')) {
						throw new SyntaxError('Invalid `v-bind` modifiers');
					}

					attrName = `^${attrName}`;
				}
			}

			const needPathVNode =
				componentCtx == null ||
				componentMeta?.props[attrName] == null;

			if (needPathVNode) {
				if (classAttrs[attrName] != null) {
					attrName = classAttrs[attrName];
					attrVal = normalizeClass(Object.cast(attrVal));
					setVNodePatchFlags(vnode, 'classes');

				} else if (styleAttrs[attrName] != null) {
					attrVal = normalizeStyle(Object.cast(attrVal));
					setVNodePatchFlags(vnode, 'styles');

				} else {
					setVNodePatchFlags(vnode, 'props');

					if (attrName.startsWith('-')) {
						attrName = `data${attrName}`;
					}

					const dynamicProps = vnode.dynamicProps ?? [];
					vnode.dynamicProps = dynamicProps;

					if (!dynamicProps.includes(attrName)) {
						dynamicProps.push(attrName);
					}
				}

				if (props[attrName] != null) {
					Object.assign(props, mergeProps({[attrName]: props[attrName]}, {[attrName]: attrVal}));

				} else {
					props[attrName] = attrVal;
				}

			} else {
				componentCtx[attrName] = attrVal;
			}
		}

		function getHandlerStore() {
			if (ctx == null) {
				throw new ReferenceError('The directive context is not found');
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
	}
});
