/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import * as block from 'components/friends/block/block';
import type * as api from 'components/friends/block/api';

interface Block {
	getMod: typeof block.getMod;
	setMod: typeof block.setMod;
	removeMod: typeof block.removeMod;

	getElementMod: typeof api.getElementMod;
	setElementMod: typeof api.setElementMod;
	removeElementMod: typeof api.removeElementMod;

	getFullBlockName: typeof api.getFullBlockName;
	getBlockSelector: typeof api.getBlockSelector;

	getFullElementName: typeof api.getFullElementName;
	getElementSelector: typeof api.getElementSelector;

	element: typeof api.element;
	elements: typeof api.elements;
}

@fakeMethods(
	'getElementMod',
	'setElementMod',
	'removeElementMod',

	'getBlockSelector',
	'getFullElementName',
	'getElementSelector',

	'element',
	'elements'
)

class Block extends Friend {
	/**
	 * A dictionary with applied modifiers
	 */
	protected readonly mods?: Dictionary<CanUndef<string>>;

	constructor(component: iBlock) {
		super(component);
		this.mods = Object.createDict();

		Object.entries(component.mods).forEach(([name, val]) => {
			this.setMod(name, val, 'initSetMod');
		});

		const {
			node,
			ctx: {
				$el: originalNode,
				$async: $a
			}
		} = this;

		const
			mountedAttrs = new Set<string>(),
			mountedAttrsGroup = {group: 'mountedAttrs'};

		if (originalNode != null && node != null && originalNode !== node) {
			Object.defineProperty(this.ctx, '$el', {
				get: () => node
			});

			node.component = component;
			mountAttrs(this.ctx.$attrs);

			this.ctx.watch('$attrs', {deep: true}, (attrs) => {
				$a.terminateWorker(mountedAttrsGroup);
				mountAttrs(attrs);
			});
		}

		function mountAttrs(attrs: Dictionary<string>) {
			if (node == null || originalNode == null) {
				return;
			}

			Object.entries(attrs).forEach(([name, attr]) => {
				if (attr == null) {
					return;
				}

				if (name === 'class') {
					attr.split(/\s+/).forEach((val) => {
						node.classList.add(val);
						mountedAttrs.add(`class.${val}`);
					});

				} else if (originalNode.hasAttribute(name)) {
					node.setAttribute(name, attr);
					mountedAttrs.add(name);
				}
			});

			$a.worker(() => {
				mountedAttrs.forEach((attr) => {
					if (attr.startsWith('class.')) {
						node.classList.remove(attr.split('.')[1]);

					} else {
						node.removeAttribute(attr);
					}
				});

				mountedAttrs.clear();
			}, mountedAttrsGroup);
		}
	}
}

Block.addToPrototype(block);

export default Block;
