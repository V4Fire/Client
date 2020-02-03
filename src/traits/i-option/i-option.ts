/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';

export default abstract class iOption {
	/**
	 * Generates or returns an option key
	 *
	 * @param el
	 * @param i
	 */
	static getOptionKey<T extends iBlock>(component: T & iOption, el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(component.optionKey) ?
			component.optionKey(el, i) :
			component.optionKey;
	}

	/**
	 * Initial component options
	 */
	abstract readonly optionsProp?: unknown[];

	/**
	 * Component options
	 */
	abstract options: unknown[];

	/**
	 * Factory for an options iterator
	 */
	abstract readonly optionsIterator?: OptionsIterator;

	/**
	 * Option component
	 */
	abstract readonly option?: string;

	/**
	 * Option unique key
	 */
	abstract readonly optionKey?: string | ((el: unknown, i: number) => string);

	/**
	 * Option component props
	 */
	abstract readonly optionProps: OptionProps;
}

export interface OptionPropParams<CTX> {
	key?: string;
	ctx: CTX;
}

export type OptionProps<CTX = unknown> =
	((el: unknown, i: number, params: OptionPropParams<CTX>) => Dictionary) | Dictionary;

export type OptionsIterator<CTX = iBlock> = (options: unknown[], ctx: CTX) => unknown[];
