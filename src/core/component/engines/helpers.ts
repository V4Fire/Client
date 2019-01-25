/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { ComponentInterface, ComponentElement } from 'core/component/interface';
import { VNodeData, VNodeDirective } from 'vue/types/vnode';

export type DocumentFragmentP = DocumentFragment & {
	getAttribute(nm: string): void;
	setAttribute(nm: string, val: string): void;
};

export type DirElement =
	Element |
	ComponentElement |
	DocumentFragmentP;

export const
	$$ = symbolGenerator();

export function addStaticDirectives(
	ctx: ComponentInterface,
	data: VNodeData,
	directives?: VNodeDirective[],
	node?: DirElement
): void {
	if (!directives) {
		return;
	}

	const
		store = ctx.$options.directives;

	if (!store) {
		return;
	}

	if (node) {
		node[$$.directives] = directives;
	}

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			dir = o[i];

		switch (dir.name) {
			case 'show':
				if (!dir.value) {
					const
						rule = ';display: none;';

					if (data.tag === 'component' && node) {
						node.setAttribute('style', (node.getAttribute('style') || '') + rule);

					} else {
						data.attrs = data.attrs || {};
						data.attrs.style = (data.attrs.style || '') + rule;
					}
				}

				break;

			case 'model':
				data.domProps = data.domProps || {};
				data.domProps.value = dir.value;
		}
	}
}

export function addDirectives(
	ctx: ComponentInterface,
	node: DirElement,
	data: VNodeData,
	directives?: VNodeDirective[]
): void {
	if (!directives) {
		return;
	}

	const
		store = ctx.$options.directives;

	if (!store) {
		return;
	}

	node[$$.directives] =
		directives;

	for (let o = directives, i = 0; i < o.length; i++) {
		const
			dir = o[i],
			customDir = store[dir.name];

		if (!customDir) {
			continue;
		}

		const vNode = Object.create(node);
		vNode.context = ctx;

		if (customDir.bind) {
			customDir.bind.call(undefined, node, dir, vNode);
		}
	}
}
