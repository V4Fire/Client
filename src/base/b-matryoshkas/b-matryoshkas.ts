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
	 * Fold all nested items
	 */
	@prop(Boolean)
	readonly folded: boolean = false;

	/**
	 * Returns props data for the fold control
	 */
	protected getFoldingProps(el: Doll): Dictionary {
		return {
			'@onClick': this.onFoldingClick.bind(this, el)
		};
	}

	/**
	 * Returns a props data for recursive calling
	 */
	protected getNestedDollProps(): Dictionary {
		const opts = {
			folded: this.folded
		};

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
	}

	/**
	 * Returns folded mod for the specified doll id
	 * @param id
	 */
	protected isFoldedMod(id: string): boolean {
		const
			target = <[HTMLElement]>this.$refs[`matryoshka-${id}`];

		if (!target) {
			return true;
		}

		return (this.block.getElMod(target[0], 'matryoshka', 'folded') || 'false') === 'false';
	}

	/**
	 * Recursively render filter
	 * @param id
	 */
	protected listFilter(id: string): boolean {
		return !this.isFoldedMod(id);
	}

	/**
	 * Handler: on fold control click
	 *
	 * @param el
	 * @emits fold(target: HTMLElement, el: Doll, value: boolean)
	 */
	protected onFoldingClick(el: Doll): void {
		const
			[target] = <[HTMLElement]>this.$refs[`matryoshka-${el.id}`],
			newVal = this.isFoldedMod(<string>el.id);

		this.block.setElMod(target, 'matryoshka', 'folded', newVal);
		this.emit('fold', target, el, newVal);
	}
}
