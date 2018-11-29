/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { DirectiveOptions } from 'vue';
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

export const
	$$ = symbolGenerator(),
	SVG_NMS = 'http://www.w3.org/2000/svg',
	XLINK_NMS = 'http://www.w3.org/1999/xlink';

const
	eventModifiers = {'!': 'capture', '&': 'passive', '~': 'once'},
	eventModifiersRgxp = new RegExp(`^[${Object.keys(eventModifiers).join('')}]+`);

export function createSVGChildren(children: Element[], ctx: Dictionary): SVGElement[] {
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

export function addDirectives(el: Element | DocumentFragmentP, data: VNodeData, directives?: VNodeDirective[]): void {
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
			nm = dir.name;

		if (store[nm]) {
			const vnode = Object.create(el);
			vnode.context = this;
			store[nm].bind(el, dir, vnode);
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

export function addProps(el: Element | DocumentFragmentP, props?: Dictionary<unknown>): void {
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

export function addAttrs(el: Element | DocumentFragmentP, attrs?: Dictionary<string>): void {
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
	if (Object.isArray(node)) {
		for (let i = 0; i < node.length; i++) {
			appendChild.call(this, parent, node[i]);
		}

	} else {
		parent.appendChild(node);
	}
}
