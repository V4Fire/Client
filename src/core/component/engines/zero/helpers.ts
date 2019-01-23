/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { DirectiveOptions } from 'vue';
import { ComponentInterface, ComponentElement } from 'core/component/interface';
import { VNodeData, VNodeDirective } from 'vue/types/vnode';

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

export type DirElement =
	Element |
	ComponentElement |
	DocumentFragmentP;

export const
	$$ = symbolGenerator(),
	SVG_NMS = 'http://www.w3.org/2000/svg',
	XLINK_NMS = 'http://www.w3.org/1999/xlink';

const
	eventModifiers = {'!': 'capture', '&': 'passive', '~': 'once'},
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);

export function createSVGChildren(this: ComponentInterface, children: Element[], ctx: Dictionary): SVGElement[] {
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
			addDirectives.call(this, node, data, el[$$.directives]);
			addStyles.call(this, node, el[$$.styles]);
			addAttrs.call(this, node, el[$$.attrs]);
			attachEvents.call(this, node, el[$$.events]);

			if (el.className) {
				node.setAttributeNS(null, 'class', el.className);
			}

			if (data.ref && Object.isObject(ctx.refs)) {
				ctx.refs[data.ref] = el;
			}

			res.push(node);

		} else {
			res.push(<SVGElement>children[i]);
		}

		if (el.children) {
			appendChild.call(this, node, createSVGChildren.call(this, Array.from(el.children), ctx));
		}
	}

	return res;
}

export function addDirectives(
	this: ComponentInterface,
	el: DirElement,
	data: VNodeData,
	directives?: VNodeDirective[]
): void {
	if (!directives) {
		return;
	}

	const
		store = this.$options.directives;

	if (!store) {
		return;
	}

	el[$$.directives] = directives;

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			dir = o[i],
			nm = dir.name,
			customDir = store[nm];

		if (customDir) {
			const vnode = Object.create(el);
			vnode.context = this;

			if (customDir.bind) {
				customDir.bind.call(undefined, el, dir, vnode);
			}

			continue;
		}

		switch (dir.name) {
			case 'show':
				if (!dir.value) {
					data.attrs = data.attrs || {};
					data.attrs.style = (data.attrs.style || '') + ';display: none;';
				}

				break;

			case 'model':
				data.domProps = data.domProps || {};
				data.domProps.value = dir.value;
		}
	}
}

export function addProps(
	this: ComponentInterface,
	el: DirElement,
	props?: Dictionary<unknown>
): void {
	if (!props) {
		return;
	}

	el[$$.props] = props;

	for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
		const key = keys[i];
		el[key] = props[key];
	}
}

type DocumentFragmentP = DocumentFragment & {
	getAttribute(nm: string): void;
	setAttribute(nm: string, val: string): void;
};

export function addAttrs(
	this: ComponentInterface,
	el: DirElement,
	attrs?: Dictionary<string>
): void {
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

export function addStyles(
	this: ComponentInterface,
	el: DirElement,
	styles?: CanArray<Dictionary<string> | string>
): void {
	const
		normalizedStyles = (<Array<Dictionary<string> | string>>[]).concat(styles || []);

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

export function addClass(this: ComponentInterface, el: Element, opts: VNodeData): void {
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

export function attachEvents(this: ComponentInterface, el: Node, events?: Dictionary<CanArray<Function>>): void {
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

export function appendChild(this: ComponentInterface, parent: Node, node: CanArray<Node>): void {
	if (!parent) {
		return;
	}

	if (Object.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			const
				el = node[i];

			if (el) {
				appendChild.call(this, parent, el);
			}
		}

	} else if (node) {
		parent.appendChild(node);
	}
}
