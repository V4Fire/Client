/* eslint-disable complexity */

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

import { ComponentEngine, DirectiveBinding, VNode } from 'core/component/engines';
import { mergeProps, normalizeStyle, normalizeClass } from 'core/component/render';

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
import type { DirectiveOptions } from 'core/component/directives/attrs/interface';

export * from 'core/component/directives/attrs/const';
export * from 'core/component/directives/attrs/interface';

ComponentEngine.directive('attrs', {
	beforeCreate(opts: DirectiveOptions, vnode: VNode) {
		let
			handlerStore,
			attrs = opts.value;

		if (attrs == null) {
			return;
		}

		const
			ctx = vnode.virtualContext?.unsafe,
			props = vnode.props ?? {};

		attrs = {...attrs};
		vnode.props ??= props;

		let
			r: CanUndef<ComponentInterface['$renderEngine']['r']>;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
					[, name, arg = '', rawModifiers = ''] = directiveRgxp.exec(attrName)!;

				let
					dir;

				switch (name) {
					case 'show': {
						dir = r?.vShow;
						break;
					}

					case 'on': {
						if (Object.isDictionary(attrVal)) {
							for (let events = Object.keys(attrVal), i = 0; i < events.length; i++) {
								const
									key = events[i],
									event = `@${key}`;

								attrs[event] = attrVal[key];
								keys.push(event);
							}
						}

						continue;
					}

					case 'bind': {
						if (Object.isDictionary(attrVal)) {
							for (let events = Object.keys(attrVal), i = 0; i < events.length; i++) {
								const key = events[i];
								attrs[key] = attrVal[key];
								keys.push(key);
							}
						}

						continue;
					}

					case 'model': {
						switch (vnode.type) {
							case 'input':
								dir = r?.[`vModel${(props.type ?? '').capitalize()}`] ?? r?.vModelText;
								break;

							case 'select':
								dir = r?.vModelSelect;
								break;

							default:
								dir = r?.vModelDynamic;
						}

						const
							cache = getHandlerStore(),
							modelProp = String(attrVal),
							handlerKey = `onUpdate:modelValue:${modelProp}`;

						let
							handler = cache.get(handlerKey);

						if (handler == null) {
							handler = (newVal) => {
								if (ctx == null) {
									throw new ReferenceError('The directive context is not found');
								}

								ctx[modelProp] = newVal;
							};

							cache.set(handlerKey, handler);
						}

						props['onUpdate:modelValue'] = handler;
						attrVal = ctx?.[modelProp];

						break;
					}

					default:
						dir = this.directive(name);
				}

				if (dir == null) {
					throw new ReferenceError(`The specified directive "${name}" is not registered`);
				}

				const
					modifiers = {};

				if (rawModifiers.length > 0) {
					for (let o = rawModifiers.split('.'), i = 0; i < o.length; i++) {
						modifiers[o[i]] = true;
					}
				}

				const dirDecl: DirectiveBinding = {
					arg,
					modifiers,

					value: attrVal,
					oldValue: null,

					instance: opts.instance,
					dir: Object.isFunction(dir) ? {created: dir} : dir
				};

				const dirs = vnode.dirs ?? [];
				vnode.dirs = dirs;

				dirs.push(dirDecl);
				continue;
			}

			// Event listener
			if (attrName.startsWith('@')) {
				let
					event = attrName.slice(1);

				const
					eventChunks = event.split('.'),
					flags = Object.createDict<boolean>();

				for (let i = 1; i < eventChunks.length; i++) {
					flags[eventChunks[i]] = true;
				}

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

				props[event] = attrVal;

				// eslint-disable-next-line no-bitwise
				if ((vnode.patchFlag & 8) === 0) {
					vnode.patchFlag += 8;
				}

				const dynamicProps = vnode.dynamicProps ?? [];
				vnode.dynamicProps = dynamicProps;
				dynamicProps.push(event);

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
						throw new SyntaxError('Invalid v-bind modifiers');
					}

					attrName = `.${attrName}`;
				}

				if (attrChunks.includes('attr') && !attrName.startsWith('^')) {
					if (attrName.startsWith('.')) {
						throw new SyntaxError('Invalid v-bind modifiers');
					}

					attrName = `^${attrName}`;
				}
			}

			if (classAttrs[attrName] != null) {
				attrName = classAttrs[attrName];
				attrVal = normalizeClass(Object.cast(attrVal));

				// eslint-disable-next-line no-bitwise
				if ((vnode.patchFlag & 2) === 0) {
					vnode.patchFlag += 2;
				}

			} else if (styleAttrs[attrName] != null) {
				attrVal = normalizeStyle(Object.cast(attrVal));

				// eslint-disable-next-line no-bitwise
				if ((vnode.patchFlag & 4) === 0) {
					vnode.patchFlag += 4;
				}

			} else {
				// eslint-disable-next-line no-bitwise
				if ((vnode.patchFlag & 8) === 0) {
					vnode.patchFlag += 8;
				}

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
