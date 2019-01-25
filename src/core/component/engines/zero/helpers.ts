/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import config from 'core/component/engines/zero/config';
import { DirectiveOptions } from 'vue';
import { ComponentInterface } from 'core/component/interface';
import { addDirectives, addStaticDirectives, $$, DirElement, DocumentFragmentP } from 'core/component/engines/helpers';
import { VNodeData } from 'vue/types/vnode';

export * from 'core/component/engines/helpers';
export interface Options extends Dictionary {
	filters: Dictionary<Function>;
	directives: Dictionary<DirectiveOptions>;
}

export const supports = {
	functional: false
};

export const options: Options = {
	filters: {},
	directives: {}
};

export const
	SVG_NMS = 'http://www.w3.org/2000/svg',
	XLINK_NMS = 'http://www.w3.org/1999/xlink';

const
	eventModifiers = {'!': 'capture', '&': 'passive', '~': 'once'},
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);

export function createSVGChildren(ctx: ComponentInterface, children: Element[]): SVGElement[] {
	if (!children || !children.length) {
		return [];
	}

	const
		res = <ReturnType<typeof createSVGChildren>>[];

	for (let i = 0; i < children.length; i++) {
		const
			el = children[i],
			node = document.createElementNS(SVG_NMS, el.tagName.toLowerCase()),
			data = el[$$.data];

		if (data) {
			const
				dirs = el[$$.directives];

			addStaticDirectives(this, data, dirs, node);
			addDirectives(ctx, node, data, dirs);

			addStyles(node, el[$$.styles]);
			addAttrs(node, el[$$.attrs]);
			attachEvents(node, el[$$.events]);

			if (el.className) {
				node.setAttributeNS(null, 'class', el.className);
			}

			const
				// @ts-ignore
				refs = ctx.$refs;

			if (data.ref && Object.isObject(refs)) {
				refs[data.ref] = el;
			}

			res.push(node);

		} else {
			res.push(<SVGElement>children[i]);
		}

		if (el.children) {
			appendChild(node, createSVGChildren(ctx, Array.from(el.children)));
		}
	}

	return res;
}

export function addProps(el: DirElement, props?: Dictionary<unknown>): void {
	if (!props) {
		return;
	}

	el[$$.props] = props;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const key = keys[i];
		el[key] = props[key];
	}
}

export function addAttrs(el: DirElement, attrs?: Dictionary<string>): void {
	if (!attrs) {
		return;
	}

	el[$$.attrs] = attrs;

	for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = attrs[key];

		if (val != null) {
			if (el instanceof SVGElement) {
				el.setAttributeNS(key.split(':')[0] === 'xlink' ? XLINK_NMS : null, key, val);

			} else {
				el.setAttribute(key, val);
			}
		}
	}
}

export function addStyles(el: DirElement, styles?: CanArray<object>): void {
	const
		normalizedStyles = (<object[]>[]).concat(styles || []);

	if (!normalizedStyles.length) {
		return;
	}

	el[$$.styles] = normalizedStyles;

	const
		strStyles = <string[]>[];

	for (let i = 0; i < normalizedStyles.length; i++) {
		const
			styles = normalizedStyles[i];

		if (Object.isString(styles)) {
			strStyles.push(styles);
			continue;
		}

		let
			str = '';

		for (let keys = Object.keys(styles), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = styles[key];

			if (el != null && el !== '') {
				str += `${key.dasherize()}: ${el};`;
			}
		}

		strStyles.push(str);
	}

	el.setAttribute('style', strStyles.join(';'));
}

export function createTemplate(): DocumentFragmentP {
	const
		el = <any>document.createDocumentFragment(),
		attrs = {};

	el.getAttribute = (key) => attrs[key];
	el.setAttribute = (key, val) => attrs[key] = val;

	return el;
}

export function addClass(el: Element, opts: VNodeData): void {
	const className = (<string[]>[]).concat(
		el.getAttribute('class') || '',
		opts.staticClass || '',
		opts.class || []
	).join(' ').trim();

	if (className) {
		if (el instanceof SVGElement) {
			el.setAttributeNS(null, 'class', className);

		} else {
			el.setAttribute('class', className);
		}
	}
}

export function attachEvents(el: Node, events?: Dictionary<CanArray<Function>>): void {
	if (!events) {
		return;
	}

	for (let keys = Object.keys(events), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mods = eventModifiersRgxp.exec(key),
			handlers = (<EventListener[]>[]).concat(<any>events[key] || []),
			flags = {};

		if (mods) {
			for (let o = mods[0], i = 0; i < o.length; i++) {
				flags[eventModifiers[o[i]]] = true;
			}
		}

		for (let i = 0; i < handlers.length; i++) {
			const
				fn = handlers[i];

			if (Object.isFunction(fn)) {
				const
					event = key.replace(eventModifiersRgxp, ''),
					cache = el[$$.events] = el[$$.events] || {};

				cache[event] = {fn, flags};
				el.addEventListener(event, fn, flags);
			}
		}
	}
}

export function appendChild(parent: Node, node: CanArray<Node>): void {
	if (!parent) {
		return;
	}

	if (Object.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			const
				el = node[i];

			if (el) {
				appendChild(parent, el);
			}
		}

	} else if (node) {
		parent.appendChild(node);
	}
}

export function warn(message: string, vm: object): void {
	if (Object.isFunction(config.warnHandler)) {
		config.warnHandler.call(null, message, vm);

	} else if (typeof console !== 'undefined' && Object.isFunction(console.error) && !config.silent) {
		console.error(`[Vue warn]: ${message}`);
	}
}
