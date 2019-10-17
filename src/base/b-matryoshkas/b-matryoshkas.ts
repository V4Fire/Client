/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop } from 'super/i-input/i-input';

export interface Doll extends Dictionary {
	children: Doll[];
}

@component({flyweight: true})
export default class bMatryoshkas<T> extends iBlock {
	/**
	 * Array for recursively calling
	 */
	@prop(Array)
	readonly options!: Doll[];

	/**
	 * Component name
	 */
	@prop(String)
	readonly option: string = 'b-checkbox';

	/**
	 * Props data for every option
	 */
	@prop(Function)
	readonly childAttrsFn!: Function;

	/**
	 * Returns an object of props from the specified option
	 * @param option
	 */
	protected getOptionProps(option: Doll): Dictionary {
		return {
			...option,
			...this.childAttrsFn(option)
		};
	}
}
