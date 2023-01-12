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

		Object.defineProperty(this.ctx, '$el', {
			get: () => this.node
		});

		if (this.node != null) {
			this.node.component = component;
		}
	}
}

Block.addToPrototype(block);

export default Block;
