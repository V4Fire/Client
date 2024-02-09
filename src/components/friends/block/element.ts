/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';

import { modRgxpCache, elementRxp } from 'components/friends/block/const';
import { getFullElementName } from 'components/friends/block/traverse';

import type { ModEventReason, ElementModEvent, SetElementModEvent } from 'components/friends/block/interface';

/**
 * Returns a modifier value from the specified element
 *
 * @param link - a link to the element
 * @param elName - the element name
 * @param modName - the modifier name
 *
 * @example
 * ```js
 * this.block.getElementMod(element, 'foo', 'focused');
 * ```
 */
export function getElementMod(
	this: Friend,
	link: Nullable<Element>,
	elName: string,
	modName: string
): CanUndef<string> {
	if (link == null) {
		return undefined;
	}

	const
		MOD_VALUE = 3;

	const
		pattern = `(?:^| )(${getFullElementName.call(this, elName, modName, '')}[^_ ]*)`,
		modRgxp = pattern[pattern] ?? new RegExp(pattern),
		el = modRgxp.exec(link.className);

	modRgxpCache[pattern] = modRgxp;
	return el != null ? el[1].split(elementRxp)[MOD_VALUE] : undefined;
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
 * @emits `localEmitter.el.mod.set.$name.$value(event: SetElementModEvent)`
 *
 * @example
 * ```js
 * this.block.setElementMod(element, 'foo', 'focused', true);
 * this.block.setElementMod(element, 'foo', 'focused', true, 'initSetMod');
 * ```
 */
export function setElementMod(
	this: Friend,
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
		oldValue = getElementMod.call(this, link, elName, modName);

	if (oldValue === normalizedValue) {
		return false;
	}

	removeElementMod.call(this, link, elName, modName, undefined, 'setMod');
	link.classList.add(getFullElementName.call(this, elName, modName, normalizedValue));

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
 * @emits `localEmitter.el.mod.remove.$name.$value(event: ElementModEvent)`
 *
 * @example
 * ```js
 * this.block.removeElementMod(element, 'foo', 'focused');
 * this.block.removeElementMod(element, 'foo', 'focused', true);
 * this.block.removeElementMod(element, 'foo', 'focused', true, 'setMod');
 * ```
 */
export function removeElementMod(
	this: Friend,
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
		currentVal = getElementMod.call(this, link, elName, modName);

	if (currentVal === undefined || normalizedVal !== undefined && currentVal !== normalizedVal) {
		return false;
	}

	link.classList.remove(
		getFullElementName.call(this, elName, modName, currentVal)
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
