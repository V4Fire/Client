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

import type iBlock from 'super/i-block/i-block';

import Friend from 'super/i-block/modules/friend';
import Block from 'super/i-block/modules/block';

import { classesCache, modsCache } from 'super/i-block/modules/provide/const';

import type { ModsTable, ModsNTable } from 'super/i-block/modules/mods';
import type { Classes, ProvideMods } from 'super/i-block/modules/provide/interface';

export * from 'super/i-block/modules/provide/const';
export * from 'super/i-block/modules/provide/interface';

/**
 * Class with methods to provide component classes/styles to another component, etc.
 */
export default class Provide extends Friend {
	/**
	 * Returns a full name of the specified component
	 *
	 * @param [modName] - modifier name
	 * @param [modValue] - modifier value
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // 'b-example'
	 * console.log(this.provide.fullComponentName());
	 *
	 * // 'b-example_opened_true'
	 * console.log(this.provide.fullComponentName('opened', true));
	 * ```
	 */
	fullComponentName(modName?: string, modValue?: unknown): string;

	/**
	 * Returns a full name of the specified component
	 *
	 * @param componentName - base component name
	 * @param [modName] - modifier name
	 * @param [modValue] - modifier value
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // 'b-foo'
	 * console.log(this.provide.fullComponentName('b-foo'));
	 *
	 * // 'b-foo_opened_true'
	 * console.log(this.provide.fullComponentName('b-foo', 'opened', true));
	 * ```
	 */
	fullComponentName(componentName: string, modName?: string, modValue?: unknown): string;
	fullComponentName(componentName?: string, modName?: string | unknown, modValue?: unknown): string {
		if (arguments.length === 2) {
			modValue = modName;
			modName = componentName;
			componentName = undefined;
		}

		componentName ??= this.componentName;
		return Block.prototype.getFullBlockName.call({componentName}, modName, modValue);
	}

	/**
	 * Returns a full name of the specified element
	 *
	 * @param componentName - base component name
	 * @param elName - element name
	 * @param [modName] - modifier name
	 * @param [modValue] - modifier value
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // 'b-example__foo'
	 * console.log(this.provide.fullElName('foo'));
	 *
	 * // 'b-example__foo_opened_true'
	 * console.log(this.provide.fullElName('foo', 'opened', true));
	 * ```
	 */
	fullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string;

	/**
	 * Returns a full name of the specified element
	 *
	 * @param elName - element name
	 * @param [modName] - modifier name
	 * @param [modValue] - modifier value
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // 'b-foo__foo'
	 * console.log(this.provide.fullElName('b-foo', 'foo'));
	 *
	 * // 'b-foo__foo_opened_true'
	 * console.log(this.provide.fullElName('b-foo', 'foo', 'opened', true));
	 * ```
	 */
	fullElName(elName: string, modName?: string, modValue?: unknown): string;
	fullElName(componentName: string, elName: string, modName?: string, modValue?: unknown): string {
		const
			l = arguments.length;

		if (l !== 2 && l !== 4) {
			modValue = modName;
			modName = elName;
			elName = componentName;
			componentName = this.componentName;
		}

		return Block.prototype.getFullElName.call({componentName}, elName, modName, modValue);
	}

	/**
	 * Returns a dictionary with the base component modifiers.
	 * The base modifiers are taken from the `baseMods` getter and can be mix in with the specified additional modifiers.
	 *
	 * @see [[iBlock.baseMods]]
	 * @param [mods] - additional modifiers (`{modifier: value}`)
	 *
	 * @example
	 * ```js
	 * this.provide.baseMods === {theme: 'foo'};
	 *
	 * // {theme: 'foo'}
	 * console.log(this.provide.mods());
	 *
	 * // {theme: 'foo', size: 'x'}
	 * console.log(this.provide.mods({size: 'x'}));
	 * ```
	 */
	mods(mods?: ProvideMods): CanUndef<Readonly<ModsNTable>> {
		const
			{baseMods} = this.ctx;

		if (!baseMods && !mods) {
			return;
		}

		const
			key = JSON.stringify(baseMods) + JSON.stringify(mods),
			cacheVal = modsCache[key];

		if (cacheVal != null) {
			return cacheVal;
		}

		const
			res = {...baseMods};

		if (mods) {
			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				res[key.dasherize()] = val != null ? String(val) : undefined;
			}
		}

		return modsCache[key] = Object.freeze(res);
	}

	/**
	 * Returns a map with classes for elements of another component.
	 * This method is used to provide some extra classes to elements of an external component.
	 *
	 * @param classes - additional classes ({baseElementName: newElementName})
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // {button: `${this.componentName}__button`}
	 * this.provide.classes({button: true});
	 *
	 * // {button: `${this.componentName}__submit`}
	 * this.provide.classes({button: 'submit'});
	 *
	 * // {button: `${this.componentName}__submit_focused_true`}
	 * this.provide.classes({button: ['submit', 'focused', 'true']});
	 * ```
	 */
	classes(classes: Classes): Readonly<Dictionary<string>>;

	/**
	 * Returns a map with classes for elements of another component.
	 * This method is used to provide some extra classes to elements of an external component.
	 *
	 * @param componentName - base component name
	 * @param [classes] - additional classes (`{baseElementName: newElementName}`)
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // {button: 'b-foo__button'}
	 * this.provide.classes('b-foo', {button: true});
	 *
	 * // {button: 'b-foo__submit'}
	 * this.provide.classes('b-foo', {button: 'submit'});
	 *
	 * // {button: 'b-foo__submit_focused_true'}
	 * this.provide.classes('b-foo', {button: ['submit', 'focused', 'true']});
	 * ```
	 */
	classes(componentName: string, classes?: Classes): Readonly<Dictionary<string>>;
	classes(nameOrClasses: string | Classes, classes?: Classes): Readonly<Dictionary<string>> {
		let
			{componentName} = this;

		if (Object.isString(nameOrClasses)) {
			componentName = nameOrClasses;

		} else {
			classes = nameOrClasses;
		}

		classes ??= {};

		const
			key = JSON.stringify(classes) + componentName,
			cache = classesCache.create('base'),
			cacheVal = cache[key];

		if (Object.isDictionary(cacheVal)) {
			return cacheVal;
		}

		const
			map = {};

		for (let keys = Object.keys(classes), i = 0; i < keys.length; i++) {
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

			// eslint-disable-next-line prefer-spread
			map[key.dasherize()] = this.fullElName.apply(this, Array.concat([componentName], el));
		}

		return cache[key] = Object.freeze(map);
	}

	/**
	 * Returns an array of component classes by the specified parameters
	 *
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // ['b-example']
	 * this.provide.componentClasses();
	 *
	 * // ['b-example', 'b-example_checked_true']
	 * this.provide.componentClasses({checked: true});
	 * ```
	 */
	componentClasses(mods?: ModsTable): readonly string[];

	/**
	 * Returns an array of component classes by the specified parameters
	 *
	 * @param componentName - base component name
	 * @param [mods] - map of additional modifiers
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // ['b-foo']
	 * this.provide.componentClasses('b-foo');
	 *
	 * // ['b-foo', 'b-foo_checked_true']
	 * this.provide.componentClasses('b-foo', {checked: true});
	 * ```
	 */
	componentClasses(componentName: string, mods?: ModsTable): readonly string[];
	componentClasses(nameOrMods?: string | ModsTable, mods?: ModsTable): readonly string[] {
		let
			{componentName} = this;

		if (arguments.length === 1) {
			if (Object.isString(nameOrMods)) {
				componentName = nameOrMods;

			} else {
				mods = nameOrMods;
			}

		} else if (Object.isString(nameOrMods)) {
			componentName = nameOrMods;
		}

		mods ??= {};

		const
			key = JSON.stringify(mods) + componentName,
			cache = classesCache.create('components', this.componentName),
			cacheVal = cache[key];

		if (Object.isArray(cacheVal)) {
			return <readonly string[]>cacheVal;
		}

		const
			classes = [this.fullComponentName(componentName)];

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(this.fullComponentName(componentName, key, val));
			}
		}

		return cache[key] = Object.freeze(classes);
	}

	/**
	 * Returns an array of element classes by the specified parameters
	 *
	 * @param els - map of elements with modifiers (`{button: {focused: true}}`)
	 *
	 * @example
	 * ```js
	 * this.provide.componentName === 'b-example';
	 *
	 * // [this.componentId, 'b-example__button', 'b-example__button_focused_true']
	 * this.provide.elClasses({button: {focused: true}});
	 * ```
	 */
	elClasses(els: Dictionary<ModsTable>): readonly string[];

	/**
	 * Returns an array of element classes by the specified parameters
	 *
	 * @param componentNameOrCtx - component name or a link to the component context
	 * @param els - map of elements with modifiers ({button: {focused: true}})
	 *
	 * @example
	 * ```js
	 * this.componentName === 'b-example';
	 *
	 * // ['b-foo__button', 'b-foo__button_focused_true']
	 * this.provide.elClasses('b-foo', {button: {focused: true}});
	 *
	 * // [
	 * //   anotherComponent.componentId,
	 * //   anotherComponent.componentName,
	 * //   `${anotherComponent.componentName}__button_focused_true`
	 * // ]
	 * this.provide.elClasses(anotherComponent, {button: {focused: true}});
	 * ```
	 */
	elClasses(componentNameOrCtx: string | iBlock, els: Dictionary<ModsTable>): readonly string[];
	elClasses(nameCtxEls: string | iBlock | Dictionary<ModsTable>, els?: Dictionary<ModsTable>): readonly string[] {
		let
			componentId,
			{componentName} = this;

		if (arguments.length === 1) {
			componentId = this.componentId;

			if (Object.isDictionary(nameCtxEls)) {
				els = nameCtxEls;
			}

		} else if (Object.isString(nameCtxEls)) {
			componentName = nameCtxEls;

		} else {
			componentId = (<iBlock>nameCtxEls).componentId;
			componentName = (<iBlock>nameCtxEls).componentName;
		}

		if (!els) {
			return Object.freeze([]);
		}

		const
			key = JSON.stringify(els),
			cache = classesCache.create('els', componentId ?? componentName),
			cacheVal = cache[key];

		if (cacheVal != null) {
			return <readonly string[]>cacheVal;
		}

		const
			classes = componentId != null ? [componentId] : [];

		for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
			const
				el = keys[i],
				mods = els[el];

			classes.push(
				this.fullElName(componentName, el)
			);

			if (!Object.isPlainObject(mods)) {
				continue;
			}

			for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					val = mods[key];

				if (val !== undefined) {
					classes.push(this.fullElName(componentName, el, key, val));
				}
			}
		}

		return Object.freeze(cache[key] = classes);
	}

	/**
	 * Returns an array of hint classes by the specified parameters
	 *
	 * @param [pos] - hint position
	 *
	 * @example
	 * ```js
	 * // ['g-hint', 'g-hint_pos_bottom']
	 * this.provide.hintClasses();
	 * ```
	 */
	hintClasses(pos: string = 'bottom'): readonly string[] {
		return this.componentClasses('g-hint', {pos});
	}
}
