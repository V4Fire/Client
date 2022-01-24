/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from '@src/core/symbol';

import type {

	VNode,
	VNodeData,
	VNodeDirective,
	DirectiveOptions

} from 'vue';

import config from '@src/core/component/engines/zero/config';
import { document } from '@src/core/component/engines/zero/const';

import {

	eventModifiers,
	eventModifiersRgxp,

	SVG_NMS,
	XLINK_NMS

} from '@src/core/component/engines/zero/helpers/const';

import type { ComponentInterface } from '@src/core/component/interface';
import type { DirElement, DocumentFragmentP } from '@src/core/component/engines/zero/helpers/interface';

export * from '@src/core/component/engines/zero/helpers/const';
export * from '@src/core/component/engines/zero/helpers/interface';

export const
	$$ = symbolGenerator();

export function addToRefs(el: Element, data: Nullable<VNodeData>, refs: Nullable<Dictionary>): void {
	if (data == null) {
		return;
	}

	const
		{ref} = data;

	if (ref == null || ref === '' || refs == null) {
		return;
	}

	if (data.refInFor === true) {
		const
			arr = <Element[]>(refs[ref] ?? []);

		refs[ref] = arr;
		arr.push(el);

	} else {
		refs[ref] = el;
	}
}

export function createSVGChildren(ctx: ComponentInterface, children: Nullable<Element[]>): SVGElement[] {
	if (children == null || children.length === 0) {
		return [];
	}

	const
		res = <ReturnType<typeof createSVGChildren>>[];

	for (let i = 0; i < children.length; i++) {
		const
			el = children[i],
			node = document.createElementNS(SVG_NMS, el.tagName.toLowerCase()),
			data = el[$$.data];

		if (data != null) {
			const
				dirs = el[$$.directives];

			addDirectives(ctx, node, data, dirs);
			addStaticDirectives(ctx, data, dirs, node);

			const
				// @ts-ignore (access)
				refs = ctx.$refs;

			addToRefs(el, data, refs);

			addStyles(node, el[$$.styles]);
			addAttrs(node, el[$$.attrs]);
			attachEvents(node, el[$$.events]);

			if (Object.isTruly(el.className)) {
				node.setAttributeNS(null, 'class', el.className);
			}

			res.push(node);

		} else {
			res.push(<SVGElement>children[i]);
		}

		if (Object.size(el.children) > 0) {
			appendChild(node, createSVGChildren(ctx, Array.from(el.children)));
		}
	}

	return res;
}

export function addProps(el: DirElement, props?: Dictionary): void {
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
				el.setAttributeNS(key.split(':', 1)[0] === 'xlink' ? XLINK_NMS : null, key, val);

			} else {
				el.setAttribute(key, val);
			}
		}
	}
}

export function addStyles(el: DirElement, styles?: CanArray<Nullable<string | object>>): void {
	const
		normalizedStyles = Array.concat([], styles);

	if (normalizedStyles.length === 0) {
		return;
	}

	el[$$.styles] = normalizedStyles;

	const
		strStyles = <string[]>[];

	for (let i = 0; i < normalizedStyles.length; i++) {
		const
			styles = normalizedStyles[i];

		if (!Object.isTruly(styles)) {
			continue;
		}

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
		el = document.createDocumentFragment(),
		attrs = {};

	el['getAttribute'] = (key) => attrs[key];
	el['setAttribute'] = (key, val) => attrs[key] = val;

	return Object.cast(el);
}

export function addClass(el: Element, opts: VNodeData): void {
	const className = Array
		.concat([], el.getAttribute('class') ?? '', opts.staticClass ?? '', ...Array.concat([], opts.class))
		.join(' ')
		.trim();

	if (className.length > 0) {
		if (el instanceof SVGElement) {
			el.setAttributeNS(null, 'class', className);

		} else {
			el.setAttribute('class', className);
		}
	}
}

export function attachEvents(el: Node, events?: Dictionary<CanArray<Function>>): void {
	if (events == null) {
		return;
	}

	for (let keys = Object.keys(events), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			mods = eventModifiersRgxp.exec(key),
			handlers = Array.concat([], events[key]),
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
					cache = el[$$.events] ?? {};

				el[$$.events] = cache;
				cache[event] = {fn, flags};

				el.addEventListener(event, fn, flags);
			}
		}
	}
}

export function appendChild(parent: Nullable<Node>, node: Nullable<CanArray<Node>>): void {
	if (parent == null || node == null) {
		return;
	}

	if (Object.isArray(node) || node instanceof HTMLCollection) {
		for (let i = 0; i < node.length; i++) {
			const
				el = node[i];

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (el != null) {
				appendChild(parent, el);
			}
		}

	} else {
		parent.appendChild(node);
	}
}

export function warn(message: string, vm: object): void {
	// eslint-disable-next-line @typescript-eslint/unbound-method
	if (Object.isFunction(config.warnHandler)) {
		config.warnHandler.call(null, message, vm);

	} else if (typeof console !== 'undefined' && Object.isFunction(console.error) && !config.silent) {
		console.error(`[Vue warn]: ${message}`);
	}
}

export function addStaticDirectives(
	component: ComponentInterface,
	data: VNodeData,
	directives?: VNodeDirective[],
	node?: DirElement
): void {
	if (directives == null) {
		return;
	}

	const
		store = component.$options.directives;

	if (store == null) {
		return;
	}

	if (node != null) {
		node[$$.directives] = directives;
	}

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			dir = o[i];

		switch (dir.name) {
			case 'show':
				if (!Object.isTruly(dir.value)) {
					const
						rule = ';display: none;';

					if (node != null && data.tag === 'component') {
						// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
						node.setAttribute('style', (node.getAttribute('style') ?? '') + rule);

					} else {
						data.attrs = data.attrs ?? {};

						// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
						data.attrs.style = (data.attrs.style ?? '') + rule;
					}
				}

				break;

			case 'model':
				data.domProps = data.domProps ?? {};
				data.domProps.value = dir.value;
				break;

			default:
				// Do nothing
		}
	}
}

export function addDirectives(
	component: ComponentInterface,
	node: DirElement,
	data: VNodeData,
	directives?: VNodeDirective[]
): void {
	if (directives == null) {
		return;
	}

	const {
		unsafe: {$async: $a},
		$options: {directives: store}
	} = component;

	if (store == null) {
		return;
	}

	node[$$.directives] = directives;

	const
		root = component.$root.unsafe;

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			dir = o[i],
			dirParams = store[dir.name];

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (dirParams == null) {
			continue;
		}

		const vnode = Object.create(node);
		vnode.context = component;

		if (Object.isFunction(dirParams)) {
			dirParams(Object.cast(node), Object.cast(dir), vnode, Object.cast(undefined));

		} else {
			if (dirParams.bind) {
				dirParams.bind.call(undefined, node, dir, vnode);
			}

			if (dirParams.inserted) {
				const events = [
					'on-component-hook:mounted',
					`child-component-mounted:${component.componentId}`
				];

				dispatchHookFromEvents('inserted', events, dir, dirParams, vnode);
			}

			if (dirParams.unbind) {
				const events = [
					'on-component-hook:beforeDestroy',
					`child-component-destroyed:${component.componentId}`
				];

				dispatchHookFromEvents('unbind', events, dir, dirParams, vnode);
			}
		}
	}

	function dispatchHookFromEvents(
		hook: string,
		events: string[],
		dir: VNodeDirective,
		dirParams: DirectiveOptions,
		vnode: VNode
	): void {
		const clear = () => {
			for (let i = 0; i < events.length; i++) {
				// eslint-disable-next-line @typescript-eslint/no-use-before-define
				root.$off(events[i], cb);
			}
		};

		const cb = () => {
			clear();

			const
				fn = dirParams[hook];

			if (Object.isFunction(fn)) {
				return fn(node, dir, vnode);
			}
		};

		for (let i = 0; i < events.length; i++) {
			root.$once(events[i], cb);
		}

		$a.worker(clear);
	}
}
