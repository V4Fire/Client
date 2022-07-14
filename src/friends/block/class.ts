/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'friends/friend';
import type iBlock from 'super/i-block/i-block';

import * as block from 'friends/block/block';
import type * as element from 'friends/block/element';
import type * as traverse from 'friends/block/traverse';

interface Block {
	getMod: typeof block.getMod;
	setMod: typeof block.setMod;
	removeMod: typeof block.removeMod;

	getElMod: typeof element.getElMod;
	setElMod: typeof element.setElMod;
	removeElMod: typeof element.removeElMod;

	getFullBlockName: typeof block.getFullBlockName;
	getBlockSelector: typeof traverse.getBlockSelector;

	getFullElName: typeof traverse.getFullElName;
	getElSelector: typeof traverse.getElSelector;

	element: typeof traverse.element;
	elements: typeof traverse.elements;
}

@fakeMethods(
	'getElMod',
	'setElMod',
	'removeElMod',

	'getBlockSelector',
	'getFullElName',
	'getElSelector',

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

		for (let m = component.mods, keys = Object.keys(m), i = 0; i < keys.length; i++) {
			const name = keys[i];
			this.setMod(name, m[name], 'initSetMod');
		}
	}
}

Block.addToPrototype(block);

export default Block;
