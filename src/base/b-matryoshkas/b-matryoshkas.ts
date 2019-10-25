/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop } from 'super/i-block/i-block';

export interface Doll extends Dictionary {
	children: Doll[];
	folded?: boolean;
}

@component({flyweight: true})
export default class bMatryoshkas<T> extends iBlock {
	/**
	 * Array for recursively calling
	 */
	@prop(Array)
	readonly options!: Doll[];

	/**
	 * Props data for an every option
	 */
	@prop(Function)
	readonly getOptionProps!: Function;

	/**
	 * Props data for the fold control
	 */
	protected getFoldingProps(el: Doll): Dictionary {
		return {
			'@onClick': this.onFoldingClick.bind(this, el)
		};
	}

	/**
	 * Handler: on fold control click
	 * @param el
	 */
	protected onFoldingClick(el: Doll): void {
		const
			[target] = <[HTMLElement]>this.$refs[`matryoshka-${el.id}`],
			folded = this.block.getElMod(target, 'matryoshka', 'folded') || 'false',
			newVal = folded === 'false';

		el.folded = newVal;
		this.block.setElMod(target, 'matryoshka', 'folded', newVal);
	}
}
