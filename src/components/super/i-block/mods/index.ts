/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/mods/README.md]]
 * @packageDocumentation
 */

import { component, PARENT } from 'core/component';

import { field, system, computed } from 'components/super/i-block/decorators';
import { initMods, mergeMods, getReactiveMods, ModsDict, ModsDecl } from 'components/super/i-block/modules/mods';

import type iBlock from 'components/super/i-block/i-block';
import iBlockEvent from 'components/super/i-block/event';

export * from 'components/super/i-block/mods/interface';

@component({partial: 'iBlock'})
export default abstract class iBlockMods extends iBlockEvent {
	@system({atom: true, merge: mergeMods, init: initMods})
	override readonly mods!: ModsDict;

	override get sharedMods(): CanNull<ModsDict> {
		return null;
	}

	/**
	 * A special link to the parent component.
	 * This option is used with static modifier declarations to refer to parent modifiers.
	 *
	 * @example
	 * ```js
	 * @component()
	 * class Foo extends iBlock {
	 *   static mods = {
	 *     theme: [
	 *       ['light']
	 *     ]
	 *   };
	 * }
	 *
	 * @component()
	 * class Bar extends Foo {
	 *   static mods = {
	 *     theme: [
	 *       Bar.PARENT,
	 *       ['dark']
	 *     ]
	 *   };
	 * }
	 * ```
	 */
	static readonly PARENT: object = PARENT;

	/**
	 * Static declaration of component modifiers.
	 *
	 * This declaration helps to declare a default modifier value: wrap the value with square brackets.
	 * In addition, all declared modifiers can be provided to the component not only with `modsProp`, but also as their
	 * own prop values. In addition to the previous benefits, if you provide all available modifier values in the
	 * declaration, this can be useful for reflection at runtime.
	 *
	 * @example
	 * ```js
	 * @component()
	 * class Foo extends iBlock {
	 *   static mods = {
	 *     theme: [
	 *       'dark',
	 *       ['light']
	 *     ]
	 *   };
	 * }
	 * ```
	 *
	 * ```
	 * < foo :theme = 'dark'
	 * ```
	 *
	 * {@link iBlock.modsProp}
	 */
	static readonly mods: ModsDecl = {};

	/**
	 * A store of component modifiers that can cause the component to re-render
	 */
	@field({
		merge: true,
		functionalWatching: false,
		init: () => Object.create({})
	})

	protected reactiveModsStore!: ModsDict;

	/**
	 * A special getter for applied modifiers.
	 * When accessing any modifier using this getter,
	 * a reactive binding will be created between its value and the template.
	 *
	 * It is not recommended to use this getter outside the component's template,
	 * as it may lead to unexpected behavior or unnecessary re-renders.
	 */
	@computed({cache: true})
	protected get m(): Readonly<ModsDict> {
		return getReactiveMods(Object.cast(this));
	}

	/**
	 * Sets a component modifier by the specified name
	 *
	 * @param name - the modifier name
	 * @param value - the modifier value
	 */
	setMod(name: string, value?: unknown): CanPromise<boolean> {
		return this.lfc.execCbAfterBlockReady(() => this.block!.setMod(name, value)) ?? false;
	}

	/**
	 * Removes a component modifier by the specified name
	 *
	 * @param name - the modifier name
	 * @param [value] - the modifier value (if not specified, the method removes the matched modifier with any value)
	 */
	removeMod(name: string, value?: unknown): CanPromise<boolean> {
		return this.lfc.execCbAfterBlockReady(() => this.block!.removeMod(name, value)) ?? false;
	}

	/**
	 * Returns the value of the specified modifier for the root element of the application.
	 * The method uses the component's `globalName` prop if provided, otherwise it uses the `componentName` property.
	 * Note that the method returns the normalized value of the modifier.
	 *
	 * @param name - the modifier name
	 * @example
	 * ```js
	 * this.setRootMod('foo', 'blaBar');
	 * console.log(this.getRootMod('foo') === 'bla-bar');
	 * ```
	 */
	getRootMod(name: string): CanUndef<string> {
		return this.r.getRootMod(name, Object.cast(this));
	}

	/**
	 * Sets a modifier for the root element of the application based on the specified name.
	 *
	 * This method is useful when you need to attach a class that can affect the entire application.
	 * For example, if you want to disable page scrolling, you would need to add a class to the root HTML element.
	 *
	 * The method uses the component's `globalName` prop if provided, otherwise it uses the `componentName` property.
	 *
	 * @param name - the modifier name
	 * @param value - the modifier value
	 *
	 * @example
	 * ```js
	 * // this.componentName === 'b-button' && this.globalName === undefined
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-button-foo-bla'));
	 *
	 * // this.componentName === 'b-button' && this.globalName === 'bAz'
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla'));
	 * ```
	 */
	setRootMod(name: string, value: unknown): boolean {
		return this.r.setRootMod(name, value, Object.cast(this));
	}

	/**
	 * Removes a modifier from the root element of the application based on the specified name.
	 * The method uses the component's `globalName` prop if provided, otherwise it uses the `componentName` property.
	 *
	 * @param name - the modifier name
	 * @param [value] - the modifier value (if not specified, the method removes the matched modifier with any value)
	 *
	 * @example
	 * ```js
	 * this.setRootMod('foo', 'bla');
	 * console.log(document.documentElement.classList.contains('b-button-foo-bla'));
	 *
	 * this.removeRootMod('foo', 'baz');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla') === true);
	 *
	 * this.removeRootMod('foo');
	 * console.log(document.documentElement.classList.contains('b-az-foo-bla') === false);
	 * ```
	 */
	removeRootMod(name: string, value?: unknown): boolean {
		return this.r.removeRootMod(name, value, Object.cast(this));
	}
}
