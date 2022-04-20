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

import { ComponentEngine, VNode } from 'core/component/engines';
import type { DirectiveOptions } from 'core/component/directives/attrs/interface';

export * from 'core/component/directives/attrs/interface';

ComponentEngine.directive('attrs', {
	beforeCreate(opts: DirectiveOptions, vnode: VNode) {
		const props = vnode.props ?? {};
		vnode.props ??= props;

		console.log(vnode);

		const
			attrs = opts.value;

		if (attrs == null) {
			return;
		}

		for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let
				val = attrs[key];

			if (key.startsWith('v-')) {
				const
					[, rawName, name, arg, rawModifiers] = /(v-(.*?))(?::(.*?))?(\..*)?$/.exec(key)!;

				let
					modifiers;

				if (Object.isTruly(rawModifiers)) {
					modifiers = {};

					for (let o = rawModifiers.split('.'), i = 0; i < o.length; i++) {
						modifiers[o[i]] = true;
					}
				}

				const
					dir = <Dictionary>{name, rawName, value: val};

				if (Object.isTruly(arg)) {
					dir.arg = arg;
				}

				if (Object.isTruly(modifiers)) {
					dir.modifiers = modifiers;
				}

				const dirs = vnode.dirs ?? [];
				vnode.dirs = dirs;

				dirs.push();

			} else if (key.startsWith('@')) {
				let
					event = key.slice(1);

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
						original = val;

					val = (e: MouseEvent | KeyboardEvent, ...args) => {
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

						return (<Function>original)(e, ...args);
					};
				}

				props[event] = val;

			} else {
				props[key] = val;
			}
		}
	}
});
