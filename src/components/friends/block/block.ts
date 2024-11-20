/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'components/friends/friend';
import type { ModsDict } from 'components/super/i-block/i-block';

import type Block from 'components/friends/block/class';
import { modRgxpCache } from 'components/friends/block/const';

import type { ModEvent, ModEventReason, SetModEvent } from 'components/friends/block/interface';

/**
 * Returns the fully qualified block name of the associated component
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example'
 * console.log(this.block.getFullBlockName());
 * ```
 */
export function getFullBlockName(this: Friend): string;

/**
 * Returns the fully qualified block name of the associated component, given the passed modifier
 *
 * @param modName - the modifier name
 * @param modValue - the modifier value
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example_focused_true'
 * console.log(this.block.getFullBlockName('focused', true));
 * ```
 */
export function getFullBlockName(this: Friend, modName: string, modValue: unknown): string;
export function getFullBlockName(this: Friend, modName?: string, modValue?: unknown): string {
	return this.componentName + (modName != null ? `_${modName.dasherize()}_${String(modValue).dasherize()}` : '');
}

/**
 * Returns a value of the specified block modifier
 *
 * @param name - the modifier name
 * @param [fromNode] - if true, then the modifier value will be taken from the tied DOM node instead of cache
 *
 * @example
 * ```js
 * console.log(this.block.getMod('focused'));
 * console.log(this.block.getMod('focused', true));
 * ```
 */
export function getMod(this: Block, name: string, fromNode?: boolean): CanUndef<string> {
	const
		{mods, node} = this;

	if (mods != null && !fromNode) {
		return mods[name.camelize(false)];
	}

	if (node == null) {
		return undefined;
	}

	const
		MOD_VALUE = 2;

	const
		pattern = `(?:^| )(${this.getFullBlockName(name, '')}[^_ ]*)`,
		modifierRgxp = modRgxpCache[pattern] ?? new RegExp(pattern),
		matchedEl = modifierRgxp.exec(node.className);

	modRgxpCache[pattern] = modifierRgxp;
	return matchedEl ? matchedEl[1].split('_')[MOD_VALUE] : undefined;
}

/**
 * Sets a block modifier to the current component.
 * The method returns false if the modifier is already set.
 *
 * @param name - the modifier name to set
 * @param value - the modifier value to set
 * @param [reason] - a reason to set the modifier
 *
 * @emits `localEmitter.block.mod.set.$name.$value(event: SetModEvent)`
 * @emits `mod:set:$name(event: SetModEvent)`
 * @emits `mod:set:$name:$value(event: SetModEvent)`
 *
 * @example
 * ```js
 * this.block.setMod('focused', true);
 * this.block.setMod('focused', true, 'removeMod');
 * ```
 */
export function setMod(this: Block, name: string, value: unknown, reason: ModEventReason = 'setMod'): boolean {
	if (value == null) {
		return false;
	}

	name = name.camelize(false);

	const {
		ctx,
		mods,
		node
	} = this;

	const
		normalizedValue = String(value).dasherize(),
		oldValue = this.getMod(name);

	if (oldValue === normalizedValue) {
		return false;
	}

	const
		isInit = reason === 'initSetMod';

	let
		prevValFromDOM,
		needSync = false;

	if (isInit) {
		prevValFromDOM = this.getMod(name, true);
		needSync = prevValFromDOM !== normalizedValue;
	}

	if (needSync) {
		this.removeMod(name, prevValFromDOM, 'initSetMod');

	} else if (!isInit) {
		this.removeMod(name, undefined, 'setMod');
	}

	if (node instanceof Element && (!isInit || needSync)) {
		node.classList.add(this.getFullBlockName(name, normalizedValue));
	}

	if (mods != null) {
		mods[name] = normalizedValue;
	}

	ctx.mods[name] = normalizedValue;

	if (!ctx.isFunctional) {
		const {reactiveModsStore} = ctx.field.getFieldsStore<typeof this.ctx>();

		if (name in reactiveModsStore && reactiveModsStore[name] !== normalizedValue) {
			delete Object.getPrototypeOf(reactiveModsStore)[name];
			ctx.field.set(`reactiveModsStore.${name}`, normalizedValue);
		}
	}

	const event: SetModEvent = {
		type: 'set',
		event: 'block.mod.set',
		reason,
		name,
		value: normalizedValue,
		oldValue
	};

	this.localEmitter.emit(`block.mod.set.${name}.${normalizedValue}`, event);

	if (!isInit) {
		ctx.strictEmit(`mod:set:${name}`, event);
		ctx.strictEmit(`mod:set:${name}:${normalizedValue}`, event);
	}

	return true;
}

/**
 * Removes a block modifier from the current component.
 * The method returns false if the block does not have this modifier.
 *
 * @param name - the modifier name to remove
 * @param [value] - the modifier value to remove
 * @param [reason] - a reason to remove the modifier
 *
 * @emits `localEmitter.block.mod.remove.$name.$value(event: ModEvent)`
 * @emits `mod:remove:$name(event: ModEvent)`
 *
 * @example
 * ```js
 * this.block.removeMod('focused');
 * this.block.removeMod('focused', true);
 * this.block.removeMod('focused', true, 'setMod');
 * ```
 */
export function removeMod(this: Block, name: string, value?: unknown, reason: ModEventReason = 'removeMod'): boolean {
	name = name.camelize(false);
	value = value != null ? String(value).dasherize() : undefined;

	const {
		ctx,
		mods,
		node
	} = this;

	const
		isInit = reason === 'initSetMod',
		currentValue = this.getMod(name, isInit);

	if (currentValue === undefined || value !== undefined && currentValue !== value) {
		return false;
	}

	if (node instanceof Element) {
		node.classList.remove(this.getFullBlockName(name, currentValue));
	}

	if (mods != null) {
		mods[name] = undefined;
	}

	const
		needNotify = reason === 'removeMod';

	if (needNotify) {
		ctx.mods[name] = undefined;

		if (!ctx.isFunctional) {
			const
				reactiveModsStore = ctx.field.get<ModsDict>('reactiveModsStore');

			if (reactiveModsStore != null && name in reactiveModsStore && reactiveModsStore[name] != null) {
				delete Object.getPrototypeOf(reactiveModsStore)[name];
				ctx.field.set(`reactiveModsStore.${name}`, undefined);
			}
		}
	}

	if (!isInit) {
		const event: ModEvent = {
			type: 'remove',
			event: 'block.mod.remove',
			reason,
			name,
			value: currentValue
		};

		this.localEmitter.emit(`block.mod.remove.${name}.${currentValue}`, event);

		if (needNotify) {
			ctx.strictEmit(`mod:remove:${name}`, event);
		}
	}

	return true;
}
