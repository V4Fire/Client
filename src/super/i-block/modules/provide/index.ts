/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/provide/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import Block from 'super/i-block/modules/block';

import { ModsTable, ModsNTable } from 'super/i-block/modules/mods';
import { classesCache, modsCache } from 'super/i-block/modules/provide/const';
import { Classes, ProvideMods } from 'super/i-block/modules/provide/interface';

export * from 'super/i-block/modules/provide/const';
export * from 'super/i-block/modules/provide/interface';

/**
 * Class with methods to provide component classes/styles to another component, etc.
 */
export default class Provide extends Friend {
	/**
	 * Returns a full name of the specified component
	 *
	 * @param [modName]
	 * @param [modValue]
	 */
	fullComponentName(modName?: string, modValue?: unknown): string;

	/**
	 * Returns a full name of the specified component
	 *
	 * @param [componentName] - base component name
	 * @param [modName]
	 * @param [modValue]
	 */
	fullComponentName(componentName?: string, modName?: string, modValue?: unknown): string;
	fullComponentName(componentName?: string, modName?: string | unknown, modValue?: unknown): string {
		if (arguments.length === 2) {
			modValue = modName;
			modName = componentName;
			componentName = undefined;
		}

		componentName = componentName || this.componentName;
		return Block.prototype.getFullBlockName.call({componentName}, modName, modValue);
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param componentName
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	fullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string;

	/**
	 * Returns a full name of the specified element
	 *
	 * @param elName
	 * @param [modName]
	 * @param [modValue]
	 */
	fullElName(elName: string, modName?: string, modValue?: unknown): string;
	fullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string {
		if (!{2: true, 4: true}[arguments.length]) {
			modValue = modName;
			modName = elName;
			elName = componentName;
			componentName = '';
		}

		componentName = componentName || this.componentName;
		return Block.prototype.getFullElName.call({componentName}, elName, modName, modValue);
	}

	/**
	 * Returns a dictionary with base component modifiers
	 * @param [mods] - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
	 */
	mods(mods?: ProvideMods): CanUndef<Readonly<ModsNTable>> {
		const
			{baseMods} = this.ctx;

		if (!baseMods && !mods) {
			return;
		}

		const
			key = JSON.stringify(baseMods) + JSON.stringify(mods),
			cache = modsCache[key];

		if (cache) {
			return cache;
		}

		const
			map = modsCache[key] = {...baseMods},
			modVal = (val) => val != null ? String(val) : undefined;

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					mod = key.dasherize();

				let
					el = mods[key];

				if (!Object.isPlainObject(el)) {
					el = {default: el};
				}

				// tslint:disable-next-line:prefer-conditional-expression
				if (!(key in mods) || el[key] === undefined) {
					map[mod] = modVal(el[Object.keys(el)[0]]);

				} else {
					map[mod] = modVal(el[key]);
				}
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Returns an object with classes for elements of another component
	 *
	 * @param componentName
	 * @param [classes] - additional classes ({baseElementName: newElementName})
	 */
	classes(componentName: string, classes?: Classes): Readonly<Dictionary<string>>;

	/**
	 * Returns an object with classes for elements of another component
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	classes(classes: Classes): Readonly<Dictionary<string>>;
	classes(componentName: string | Classes, classes?: Classes): Readonly<Dictionary<string>> {
		if (!Object.isString(componentName)) {
			classes = componentName;
			componentName = '';
		}

		componentName = componentName || this.componentName;

		const
			key = JSON.stringify(classes) + componentName,
			cache = classesCache.create('base'),
			cacheVal = cache[key];

		if (cacheVal) {
			return <Readonly<Dictionary<string>>>cacheVal;
		}

		const
			map = cache[key] = {};

		if (classes) {
			const
				keys = Object.keys(classes);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = classes[key];

				if (el === true) {
					el = key;

				} else if (Object.isArray(el)) {
					el = el.slice();
					for (let i = 0; i < el.length; i++) {
						if (el[i] === true) {
							el[i] = key;
						}
					}
				}

				map[key.dasherize()] = this.fullElName.apply(this, Array.concat([componentName], el));
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Returns an array of component classes by the specified parameters
	 *
	 * @param [componentName] - name of the source component
	 * @param mods - map of modifiers
	 */
	componentClasses(componentName: CanUndef<string>, mods: ModsTable): ReadonlyArray<string>;

	/**
	 * Returns an array of component classes by the specified parameters
	 * @param mods - map of modifiers
	 */
	componentClasses(mods: ModsTable): ReadonlyArray<string>;
	componentClasses(componentName?: string | ModsTable, mods?: ModsTable): ReadonlyArray<string> {
		if (arguments.length === 1) {
			mods = <ModsTable>componentName;
			componentName = undefined;

		} else {
			mods = <ModsTable>mods;
			componentName = <CanUndef<string>>componentName;
		}

		componentName = componentName || this.componentName;

		const
			key = JSON.stringify(mods) + componentName,
			cache = classesCache.create('components', this.componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = [this.fullComponentName(componentName)];

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(this.fullComponentName(componentName, key, val));
			}
		}

		return classes;
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 *
	 * @param componentNameOrCtx - component name or a link to a component context
	 * @param els - map of elements and its modifiers ({button: {focused: true}})
	 */
	elClasses(componentNameOrCtx: string | iBlock, els: Dictionary<ModsTable>): ReadonlyArray<string>;

	/**
	 * Returns an array of element classes by the specified parameters
	 * @param els - map of elements and its modifiers ({button: {focused: true}})
	 */
	elClasses(els: Dictionary<ModsTable>): ReadonlyArray<string>;
	elClasses(
		componentNameOrCtx: string | iBlock | Dictionary<ModsTable>,
		els?: Dictionary<ModsTable>
	): ReadonlyArray<string> {
		let
			id,
			componentName;

		if (arguments.length === 1) {
			id = this.ctx.componentId;
			els = <Dictionary<ModsTable>>componentNameOrCtx;

		} else {
			if (Object.isString(componentNameOrCtx)) {
				componentName = componentNameOrCtx;

			} else {
				id = (<iBlock>componentNameOrCtx).componentId;
				componentName = (<iBlock>componentNameOrCtx).componentName;
			}
		}

		componentName = componentName || this.componentName;

		if (!els) {
			return Object.freeze([]);
		}

		const
			key = JSON.stringify(els),
			cache = classesCache.create('els', id || componentName);

		if (cache[key]) {
			return <ReadonlyArray<string>>cache[key];
		}

		const
			classes = cache[key] = id ? [id] : [];

		for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(
				this.fullElName(<string>componentName, el)
			);

			if (!Object.isPlainObject(mods)) {
				continue;
			}

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				if (val !== undefined) {
					classes.push(this.fullElName(<string>componentName, el, key, val));
				}
			}
		}

		return Object.freeze(classes);
	}

	/**
	 * Returns an array of hint classes by the specified parameters
	 * @param [pos] - hint position
	 */
	hintClasses(pos: string = 'bottom'): ReadonlyArray<string> {
		return this.componentClasses('g-hint', {pos});
	}
}
