/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Block from 'friends/block/class';

import { modRgxpCache, elRxp } from 'friends/block/const';
import type { ModEventReason, ElementModEvent, SetElementModEvent } from 'friends/block/interface';

/**
 * Returns the full name of the specified block element
 *
 * @param name - the element name
 * @param [modName] - an additional modifier name
 * @param [modValue] - an additional value name
 *
 * @example
 * ```js
 * // b-foo__bla
 * console.log(this.getFullElName('bla'));
 *
 * // b-foo__bla_focused_true
 * console.log(this.getBlockSelector('bla', 'focused', true));
 * ```
 */
export function getFullElName(this: Block, name: string, modName?: string, modValue?: unknown): string {
	const modStr = modName != null ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '';
	return `${this.componentName}__${name.dasherize()}${modStr}`;
}

/**
 * Returns a modifier value from the specified element
 *
 * @param link - a link to the element
 * @param elName - the element name
 * @param modName - the modifier name
 */
export function getElMod(this: Block, link: Nullable<Element>, elName: string, modName: string): CanUndef<string> {
	if (link == null) {
		return undefined;
	}

	const
		MOD_VALUE = 3;

	const
		pattern = `(?:^| )(${getFullElName.call(this, elName, modName, '')}[^_ ]*)`,
		modRgxp = pattern[pattern] ?? new RegExp(pattern),
		el = modRgxp.exec(link.className);

	modRgxpCache[pattern] = modRgxp;
	return el != null ? el[1].split(elRxp)[MOD_VALUE] : undefined;
}

/**
 * Sets a modifier to the specified block element.
 * The method returns false if the modifier is already set.
 *
 * @param link - a link to the element
 * @param elName - the element name
 * @param modName - the modifier name to set
 * @param value - the modifier name to set
 * @param [reason] - a reason to set the modifier
 *
 * @example
 * ```js
 * this.setElMod(node, 'foo', 'focused', true);
 * this.setElMod(node, 'foo', 'focused', true, 'initSetMod');
 * ```
 */
export function setElMod(
	this: Block,
	link: Nullable<Element>,
	elName: string,
	modName: string,
	value: unknown,
	reason: ModEventReason = 'setMod'
): boolean {
	if (link == null || value == null) {
		return false;
	}

	elName = elName.camelize(false);
	modName = modName.camelize(false);

	const
		normalizedValue = String(value).dasherize(),
		oldValue = getElMod.call(this, link, elName, modName);

	if (oldValue === normalizedValue) {
		return false;
	}

	removeElMod.call(this, link, elName, modName, undefined, 'setMod');
	link.classList.add(getFullElName.call(this, elName, modName, normalizedValue));

	const event: SetElementModEvent = {
		type: 'set',
		event: 'el.mod.set',
		reason,
		link,
		element: elName,
		name: modName,
		value: normalizedValue,
		oldValue
	};

	this.localEmitter.emit(`el.mod.set.${elName}.${modName}.${normalizedValue}`, event);
	return true;
}

/**
 * Removes a modifier from the specified block element.
 * The method returns false if the element does not have this modifier.
 *
 * @param link - a link to the element
 * @param elName - the element name
 * @param modName - the modifier name to remove
 * @param [value] - the modifier value to remove
 * @param [reason] - a reason to remove the modifier
 *
 * @example
 * ```js
 * this.removeElMod(node, 'foo', 'focused');
 * this.removeElMod(node, 'foo', 'focused', true);
 * this.removeElMod(node, 'foo', 'focused', true, 'setMod');
 * ```
 */
export function removeElMod(
	this: Block,
	link: Nullable<Element>,
	elName: string,
	modName: string,
	value?: unknown,
	reason: ModEventReason = 'removeMod'
): boolean {
	if (link == null) {
		return false;
	}

	elName = elName.camelize(false);
	modName = modName.camelize(false);

	const
		normalizedVal = value != null ? String(value).dasherize() : undefined,
		currentVal = getElMod.call(this, link, elName, modName);

	if (currentVal === undefined || normalizedVal !== undefined && currentVal !== normalizedVal) {
		return false;
	}

	link.classList.remove(
		getFullElName.call(this, elName, modName, currentVal)
	);

	const event: ElementModEvent = {
		type: 'remove',
		event: 'el.mod.remove',
		reason,
		link,
		element: elName,
		name: modName,
		value: currentVal
	};

	this.localEmitter.emit(`el.mod.remove.${elName}.${modName}.${currentVal}`, event);
	return true;
}
