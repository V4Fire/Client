/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Friend from 'friends/friend';

import type iBlock from 'super/i-block/i-block';
import type { ModsDict } from 'super/i-block/i-block';

import { baseClassesCache, componentClassesCache, elementClassesCache } from 'friends/provide/const';
import { fullComponentName, fullElementName } from 'friends/provide/names';

import type { Classes } from 'friends/provide/interface';

/**
 * Returns a map with classes for the elements of another component.
 * This function is used to assign element classes of the outer component to the elements of the inner component.
 * Use it with caution as it's a violation of component encapsulation.
 *
 * @param classes - a basemap of elements, where keys are elements in the inner component,
 *   and values are elements of the outer component
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
export function classes(this: Friend, classes: Classes): Readonly<Dictionary<string>>;

/**
 * Returns a map with classes for the elements of another component.
 * This function is used to assign element classes of the outer component to the elements of the inner component.
 * Use it with caution as it's a violation of component encapsulation.
 *
 * @param componentName - the base component name
 * @param classes - a basemap of elements, where keys are elements in the inner component,
 *   and values are elements of the outer component
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
export function classes(
	this: Friend,
	componentName: string,
	classes: Classes
): Readonly<Dictionary<string>>;

export function classes(
	this: Friend,
	componentNameOrClasses: string | Classes,
	classes?: Classes
): Readonly<Dictionary<string>> {
	let
		{componentName} = this;

	if (Object.isString(componentNameOrClasses)) {
		componentName = componentNameOrClasses;

	} else {
		classes = componentNameOrClasses;
	}

	classes ??= {};

	const
		key = JSON.stringify(classes) + componentName,
		cacheVal = baseClassesCache[key];

	if (cacheVal != null) {
		return cacheVal;
	}

	const
		map = {};

	for (let keys = Object.keys(classes), i = 0; i < keys.length; i++) {
		const
			innerEl = keys[i];

		let
			outerEl = classes[innerEl];

		if (outerEl === true) {
			outerEl = innerEl;

		} else if (Object.isArray(outerEl)) {
			outerEl = outerEl.slice();

			for (let i = 0; i < outerEl.length; i++) {
				if (outerEl[i] === true) {
					outerEl[i] = innerEl;
				}
			}
		}

		map[innerEl.dasherize()] = fullElementName.apply(this, Object.cast(Array.concat([componentName], outerEl)));
	}

	baseClassesCache[key] = Object.freeze(map);
	return map;
}

/**
 * Returns a list of classes for the current component
 *
 * @param [mods] - a dictionary with additional modifiers
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
export function componentClasses(this: Friend, mods?: ModsDict): readonly string[];

/**
 * Returns a list of classes for the specified component
 *
 * @param componentName - the component name
 * @param [mods] - a dictionary with additional modifiers
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
export function componentClasses(
	this: Friend,
	componentName: string,
	mods?: ModsDict
): readonly string[];

export function componentClasses(
	this: Friend,
	componentNameOrMods?: string | ModsDict,
	mods?: ModsDict
): readonly string[] {
	let
		{componentName} = this;

	if (arguments.length === 1) {
		if (Object.isString(componentNameOrMods)) {
			componentName = componentNameOrMods;

		} else {
			mods = componentNameOrMods;
		}

	} else if (Object.isString(componentNameOrMods)) {
		componentName = componentNameOrMods;
	}

	mods ??= {};

	const cache = componentClassesCache[this.componentName] ?? Object.createDict();
	componentClassesCache[this.componentName] = cache;

	const
		key = JSON.stringify(mods) + componentName,
		cacheVal = cache[key];

	if (cacheVal != null) {
		return cacheVal;
	}

	const
		classes = [(<Function>fullComponentName).call(this, componentName)];

	for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			val = mods[key];

		if (val !== undefined) {
			classes.push(fullComponentName.call(this, componentName, key, val));
		}
	}

	cache[key] = Object.freeze(classes);
	return classes;
}

/**
 * Returns a list of classes for the specified element of the current component
 *
 * @param els - a map of the elements for which you want to get classes, where the keys are the names of the elements,
 *   and the value is a dictionary of applied modifiers
 *
 * @example
 * ```js
 * this.provide.componentName === 'b-example';
 *
 * // [this.componentId, 'b-example__button', 'b-example__button_focused_true']
 * this.provide.elementClasses({button: {focused: true}});
 * ```
 */
export function elementClasses(this: Friend, els: Dictionary<ModsDict>): readonly string[];

/**
 * Returns a list of classes for the specified element of the passed component
 *
 * @param componentNameOrCtx - the component name or a link to the component context
 * @param els - a map of the elements for which you want to get classes, where the keys are the names of the elements,
 *   and the value is a dictionary of applied modifiers
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // ['b-foo__button', 'b-foo__button_focused_true']
 * this.provide.elementClasses('b-foo', {button: {focused: true}});
 *
 * // [
 * //   anotherComponent.componentId,
 * //   anotherComponent.componentName,
 * //   `${anotherComponent.componentName}__button_focused_true`
 * // ]
 * this.provide.elementClasses(anotherComponent, {button: {focused: true}});
 * ```
 */
export function elementClasses(
	this: Friend,
	componentNameOrCtx: string | iBlock,
	els: Dictionary<ModsDict>
): readonly string[];

export function elementClasses(
	this: Friend,
	nameCtxEls: string | iBlock | Dictionary<ModsDict>,
	els?: Dictionary<ModsDict>
): readonly string[] {
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

	if (els == null) {
		return Object.freeze([]);
	}

	const
		cacheId = componentId ?? componentName,
		cache = elementClassesCache[cacheId] ?? Object.createDict();

	elementClassesCache[cacheId] = cache;

	const
		key = JSON.stringify(els),
		cacheVal = cache[key];

	if (cacheVal != null) {
		return cacheVal;
	}

	const
		classes = componentId != null ? [componentId] : [];

	for (let keys = Object.keys(els), i = 0; i < keys.length; i++) {
		const
			el = keys[i],
			mods = els[el];

		classes.push(
			(<Function>fullElementName).call(this, componentName, el)
		);

		if (!Object.isDictionary(mods)) {
			continue;
		}

		for (let keys = Object.keys(mods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				val = mods[key];

			if (val !== undefined) {
				classes.push(fullElementName.call(this, componentName, el, key, val));
			}
		}
	}

	cache[key] = Object.freeze(classes);
	return classes;
}

/**
 * Returns a list of hint classes by the specified parameters
 *
 * @param [pos] - the hint position
 *
 * @example
 * ```js
 * // ['g-hint', 'g-hint_pos_bottom']
 * this.provide.hintClasses();
 * ```
 */
export function hintClasses(this: Friend, pos: string = 'bottom'): readonly string[] {
	return componentClasses.call(this, 'g-hint', {pos});
}
