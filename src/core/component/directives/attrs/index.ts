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
import type { ComponentInterface } from 'core/component/interface';

import { modRgxp, directiveRgxp, handlers } from 'core/component/directives/attrs/const';
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
			ctx = Object.cast<ComponentInterface>(opts.instance),
			props = vnode.props ?? {};

		attrs = {...attrs};
		vnode.props ??= props;

		for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
			let
				attrName = keys[i],
				attrVal = attrs[attrName];

			if (attrName.startsWith('v-')) {
				const
					[, name, arg = '', rawModifiers = ''] = directiveRgxp.exec(attrName)!;

				let
					dir;

				switch (name) {
					case 'show': {
						const
							{r} = ctx.$renderEngine;

						dir = r.vShow;
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
						const
							{r} = ctx.$renderEngine;

						switch (vnode.type) {
							case 'input':
								dir = r[`vModel${(props.type ?? '').capitalize()}`] ?? r.vModelText;
								break;

							case 'select':
								dir = r.vModelSelect;
								break;

							default:
								dir = r.vModelDynamic;
						}

						const
							cache = getHandlerStore(),
							modelProp = String(attrVal),
							handlerKey = `onUpdate:modelValue:${modelProp}`;

						let
							handler = cache.get(handlerKey);

						if (handler == null) {
							handler = (newVal) => ctx[modelProp] = newVal;
							cache.set(handlerKey, handler);
						}

						props['onUpdate:modelValue'] = handler;
						attrVal = ctx[modelProp];

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

			} else if (attrName.startsWith('@')) {
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
						originalHandler = attrVal;

					attrVal = (e: MouseEvent | KeyboardEvent, ...args) => {
						if (
							flags.ctrl && !e.ctrlKey ||
							flags.alt && !e.altKey ||
							flags.shift && !e.shiftKey ||
							flags.meta && !e.metaKey ||
							flags.exact && (
								!flags.ctrl && e.ctrlKey ||
								!flags.alt && e.altKey ||
								!flags.shift && e.shiftKey ||
								!flags.meta && e.metaKey
							)
						) {
							return;
						}

						if (e instanceof MouseEvent) {
							if (flags.middle && e.button !== 1) {
								return;
							}

						} else if (e instanceof KeyboardEvent) {
							if (
								flags.enter && e.key !== 'Enter' ||
								flags.tab && e.key !== 'Tab' ||
								flags.delete && (e.key !== 'Delete' && e.key !== 'Backspace') ||
								flags.esc && e.key !== 'Escape' ||
								flags.space && e.key !== ' ' ||
								flags.up && e.key !== 'ArrowUp' ||
								flags.down && e.key !== 'ArrowDown' ||
								flags.left && e.key !== 'ArrowLeft' ||
								flags.right && e.key !== 'ArrowRight'
							) {
								return;
							}
						}

						if (flags.self && e.target !== e.currentTarget) {
							return;
						}

						if (flags.prevent) {
							e.preventDefault();
						}

						if (flags.stop) {
							e.stopPropagation();
						}

						return (<Function>originalHandler)(e, ...args);
					};
				}

				props[event] = attrVal;

			} else {
				attrName = attrName.startsWith(':') ? attrName.slice(1) : attrName;

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

				console.log(attrName, attrVal);
				props[attrName] = attrVal;
			}
		}

		function getHandlerStore() {
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
