/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/unified-signatures */

import type Friend from 'components/friends/friend';
import { getFullBlockName, getFullElementName } from 'components/friends/block';

/**
 * Returns the fully qualified component name
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example'
 * console.log(this.provide.fullComponentName());
 * ```
 */
export function fullComponentName(this: Friend): string;

/**
 * Returns the fully qualified component name, given the passed modifier
 *
 * @param modName - the modifier name
 * @param modValue - the modifier value
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example_opened_true'
 * console.log(this.provide.fullComponentName('opened', true));
 * ```
 */
export function fullComponentName(
	this: Friend,
	modName: string,
	modValue: unknown
): string;

/**
 * Returns the fully qualified component name based on the passed one
 *
 * @param componentName - the base component name
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-foo'
 * console.log(this.provide.fullComponentName('b-foo'));
 * ```
 */
export function fullComponentName(this: Friend, componentName: string): string;

/**
 * Returns the fully qualified component name based on the passed one with the applied modifier
 *
 * @param componentName - the base component name
 * @param modName - the modifier name
 * @param modValue - the modifier value
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
export function fullComponentName(
	this: Friend,
	componentName: string,
	modName: string,
	modValue: unknown
): string;

export function fullComponentName(
	this: Friend,
	componentNameOrModName?: string,
	modNameOrValue?: string | unknown,
	modValue?: unknown
): string {
	let
		componentName: string,
		modName: unknown;

	if (arguments.length === 2) {
		componentName = this.componentName;
		modName = componentNameOrModName;
		modValue = modNameOrValue;

	} else {
		componentName = componentNameOrModName ?? this.componentName;
		modName = modNameOrValue;
	}

	const ctx = Object.create(this, {
		componentName: {value: componentName}
	});

	return getFullBlockName.call(ctx, modName, modValue);
}

/**
 * Returns the fully qualified name of the specified element
 *
 * @param elName - the base element name
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example__foo'
 * console.log(this.provide.fullElementName('foo'));
 * ```
 */
export function fullElementName(this: Friend, elName: string): string;

/**
 * Returns the fully qualified name of the specified element, given the passed modifier
 *
 * @param elName - the base element name
 * @param modName - the modifier name
 * @param modValue - the modifier value
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-example__foo'
 * console.log(this.provide.fullElementName('foo'));
 *
 * // 'b-example__foo_opened_true'
 * console.log(this.provide.fullElementName('foo', 'opened', true));
 * ```
 */
export function fullElementName(
	this: Friend,
	elName: string,
	modName: string,
	modValue: unknown
): string;

/**
 * Returns the fully qualified name of the specified element
 *
 * @param componentName - the base component name
 * @param elName - the base element name
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-foo__bar'
 * console.log(this.provide.fullElementName('b-foo', 'bar'));
 * ```
 */
export function fullElementName(
	this: Friend,
	componentName: string,
	elName: string
): string;

/**
 * Returns the fully qualified name of the specified element, given the passed modifier
 *
 * @param componentName - the base component name
 * @param elName - the base element name
 * @param modName - the modifier name
 * @param modValue - the modifier value
 *
 * @example
 * ```js
 * this.componentName === 'b-example';
 *
 * // 'b-foo__bar_opened_true'
 * console.log(this.provide.fullElementName('b-foo', 'bar', 'opened', true));
 * ```
 */
export function fullElementName(
	this: Friend,
	componentName: string,
	elName: string,
	modName: string,
	modValue: unknown
): string;

export function fullElementName(
	this: Friend,
	componentNameOrElName: string,
	elNameOrModName?: string,
	modNameOrModValue?: string | unknown,
	modValue?: unknown
): string {
	const l = arguments.length;

	let
		componentName: string,
		elName: CanUndef<string>,
		modName: unknown;

	if (l !== 2 && l !== 4) {
		componentName = this.componentName;
		elName = componentNameOrElName;
		modName = elNameOrModName;
		modValue = modNameOrModValue;

	} else {
		componentName = componentNameOrElName;
		elName = elNameOrModName;
		modName = modNameOrModValue;
	}

	const ctx = Object.create(this, {
		componentName: {value: componentName}
	});

	return getFullElementName.call(ctx, elName, modName, modValue);
}
