/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop, ModsDecl } from 'super/i-block/i-block';

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
	readonly getOptionProps!: Function;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		folded: [
			['false'],
			'true'
		]
	};

	/**
	 * Props data for the fold control
	 */
	protected getFoldingProps(): Dictionary {
		return {
			'@onClick': this.onFoldingClick
		};
	}

	/**
	 * Handler: on fold control click
	 */
	protected onFoldingClick(): void {
		this.setMod('folded', this.mods.folded === 'false');
	}
}
