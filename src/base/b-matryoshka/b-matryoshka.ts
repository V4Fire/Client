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
	level?: number;
}

@component({flyweight: true})
export default class bMatryoshka extends iBlock {
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
	 * Chunks count for the async render
	 */
	@prop(Number)
	readonly renderChunks: number = 5;

	/**
	 * Fold all nested items
	 */
	@prop(Boolean)
	readonly folded: boolean = false;

	/**
	 * Link to the first level component
	 */
	protected get firstLevel(): bMatryoshka {
		return this.isFlyweight ? <bMatryoshka>this.$normalParent : this;
	}

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
	protected getFoldedMod(id: string): CanUndef<string> {
		const
			target = this.$parent && this.$parent.$el.querySelector(`[data-id=matryoshka-${id}]`);

		if (!target) {
			return;
		}

		return this.firstLevel.block.getElMod(target, 'matryoshka', 'folded');
	}

	/**
	 * Recursively render filter
	 * @param id
	 */
	protected listFilter(id: string): boolean {
		if (this.firstLevel.hook !== 'mounted') {
			return false;
		}

		return this.getFoldedMod(id) === 'false';
	}

	/**
	 * Handler: on fold control click
	 *
	 * @param el
	 * @emits fold(target: HTMLElement, el: Doll, value: boolean)
	 */
	protected onFoldingClick(el: Doll): void {
		const
			target = this.$parent && <HTMLElement>(this.$parent.$el.querySelector(`[data-id=matryoshka-${el.id}]`));

		const
			newVal = this.getFoldedMod(<string>el.id) === 'false';

		if (target) {
			this.firstLevel.block.setElMod(target, 'matryoshka', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
