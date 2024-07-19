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
import type { ModEventReason, ModsProp } from 'components/super/i-block/i-block';

interface Block {
	getMod(name: string, fromNode?: boolean): CanUndef<string>;
	setMod(name: string, value: unknown, reason?: ModEventReason): boolean;
	removeMod(name: string, value?: unknown, reason?: ModEventReason): boolean;

	getElementMod(
		link: Nullable<Element>,
		elName: string,
		modName: string
	): CanUndef<string>;

	setElementMod(
		link: Nullable<Element>,
		elName: string,
		modName: string,
		value: unknown,
		reason?: ModEventReason
	): boolean;

	removeElementMod(
		link: Nullable<Element>,
		elName: string,
		modName: string,
		value?: unknown,
		reason?: ModEventReason
	): boolean;

	getFullBlockName(): string;
	getFullBlockName(modName: string, modValue: unknown): string;

	getBlockSelector(mods?: ModsProp): string;

	getFullElementName(name: string): string;
	getFullElementName(name: string, modName: string, modValue: unknown): string;
	getElementSelector(name: string, mods?: ModsProp): string;

	element<E extends Element = Element>(ctx: Element, name: string, mods?: ModsProp): CanNull<E>;
	element<E extends Element = Element>(name: string, mods?: ModsProp): CanNull<E>;

	elements<E extends Element = Element>(ctx: Element, name: string, mods?: ModsProp): ArrayLike<E>;
	elements<E extends Element = Element>(name: string, mods?: ModsProp): ArrayLike<E>;
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
	}
}

Block.addToPrototype(block);

export default Block;
