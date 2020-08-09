/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeData } from 'core/component/engines';
import { vAttrsRgxp } from 'core/component/render-function/const';
import { ComponentMeta } from 'core/component/interface';

/**
 * Applies dynamic attributes from v-attrs to the specified vnode
 *
 * @param vnode - vnode data object
 * @param [component] - component meta object that is tied to the vnode
 */
export function applyDynamicAttrs(vnode: VNodeData, component?: ComponentMeta): void {
	const
		attrs = vnode.attrs ?? {},
		attrsSpreadObj = attrs['v-attrs'],
		slotsSpreadObj = attrs['v-slots'];

	vnode.attrs = attrs;
	delete attrs['v-attrs'];
	delete attrs['v-slots'];

	if (Object.isPlainObject(slotsSpreadObj)) {
		const
			slotOpts = vnode.scopedSlots ?? {};

		for (let keys = Object.keys(slotsSpreadObj), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			let nm = `@${key}`;
			nm = slotOpts[nm] ? nm : '@';

			if (slotOpts[nm]) {
				const
					fn = slotOpts[nm];

				slotOpts[key] = (obj) => {
					obj.slotContent = slotsSpreadObj[key];
					return (<Function>fn)(obj);
				};

				if (nm === '@') {
					delete slotOpts[nm];
				}
			}
		}

		delete slotOpts['@'];
	}

	if (Object.isPlainObject(attrsSpreadObj)) {
		const
			eventOpts = vnode.on ?? {},
			nativeEventOpts = vnode.nativeOn ?? {},
			directiveOpts = vnode.directives ?? [];

		vnode.on = eventOpts;
		vnode.nativeOn = nativeEventOpts;
		vnode.directives = directiveOpts;

		for (let keys = Object.keys(attrsSpreadObj), i = 0; i < keys.length; i++) {
			let
				key = keys[i],
				val = attrsSpreadObj[key];

			if (component) {
				const
					propKey = `${key}Prop`;

				if (!component.props[key] && component.props[propKey]) {
					key = propKey;
				}
			}

			if (key.startsWith('@')) {
				let
					event = key.slice(1);

				if (component) {
					const
						eventChunks = event.split('.'),
						flags = <Dictionary<boolean>>{};

					for (let i = 1; i < eventChunks.length; i++) {
						flags[eventChunks[i]] = true;
					}

					event = eventChunks[0].dasherize();

					if (flags.native) {
						if (flags.right) {
							event = 'contextmenu';
						}

						if (flags.capture) {
							event = `!${event}`;
						}

						if (flags.once) {
							event = `~${event}`;
						}

						if (flags.passive) {
							event = `&${event}`;
						}

						if (flags.self || flags.prevent || flags.stop) {
							const
								originalFn = val;

							val = (e: Event | MouseEvent) => {
								if (flags.prevent) {
									e.preventDefault();
								}

								if (flags.self && e.target !== e.currentTarget) {
									return null;
								}

								if (flags.stop) {
									e.stopPropagation();
								}

								return (<Function>originalFn)(e);
							};
						}

						if (!(event in nativeEventOpts)) {
							nativeEventOpts[event] = val;
						}

					} else if (!(event in eventOpts)) {
						eventOpts[event] = val;
					}

				} else if (!(event in eventOpts)) {
					eventOpts[event] = val;
				}

			} else if (key.startsWith('v-')) {
				const
					[, rawName, name, arg, rawModifiers] = vAttrsRgxp.exec(key);

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

				directiveOpts.push(<any>dir);

			} else if (key === 'staticClass') {
				vnode.staticClass = Array.concat([], vnode.staticClass, val).join(' ');

			} else if (key === 'class') {
				vnode.class = Array.concat([], vnode.class, val);

			} else if (key === 'style') {
				vnode.style = Array.concat([], vnode.style, val);

			} else if (attrs[key] == null) {
				attrs[key] = val;
			}
		}
	}
}
