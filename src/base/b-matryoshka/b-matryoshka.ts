/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop } from 'super/i-block/i-block';

export interface Doll extends Dictionary {
	id: string;
	parentId?: string;
	children?: Doll[];
}

@component({flyweight: true})
export default class bMatryoshka extends iBlock {
	/**
	 * Component options
	 */
	@prop(Array)
	readonly options!: Doll[];

	/**
	 * Number of chunks for the async render
	 */
	@prop(Number)
	readonly renderChunks: number = 5;

	/**
	 * If true, then all nested elements will be folded by default
	 */
	@prop(Boolean)
	readonly folded: boolean = true;

	/**
	 * Component level (internal parameter)
	 */
	@prop(Number)
	readonly level: number = 0;

	/**
	 * Link to the top level component
	 */
	protected get top(): this {
		return this.isFlyweight && <this>this.$normalParent || this;
	}

	/**
	 * Returns props data for the specified fold element
	 * @param el
	 */
	protected getFoldingProps(el: Doll): Dictionary {
		return {
			'@click': this.onFoldingClick.bind(this, el)
		};
	}

	/**
	 * Returns props data for the specified iterated element
	 * @param el
	 */
	protected getOptionProps(el: Doll): Dictionary {
		return Object.reject(el, 'children');
	}

	/**
	 * Returns props data for recursive calling
	 */
	protected getNestedDollProps(): Dictionary {
		const opts = {
			folded: this.folded,
			level: this.level + 1
		};

		if (this.$listeners.fold) {
			opts['@fold'] = this.$listeners.fold;
		}

		return opts;
	}

	/**
	 * Returns a folded modifier for the specified doll identifier
	 * @param id
	 */
	protected getFoldedMod(id: string): CanUndef<string> {
		const
			target = this.searchDollElement(id);

		if (!target) {
			return;
		}

		return this.top.block.getElMod(target, 'matryoshka', 'folded');
	}

	/**
	 * Recursively render filter
	 * @param id
	 */
	protected listFilter(id: string): boolean {
		if (this.top.hook !== 'mounted') {
			return false;
		}

		return this.getFoldedMod(id) === 'false';
	}

	/**
	 * Searches HTML element with the specified identifier
	 * @param id
	 */
	protected searchDollElement(id: string): CanUndef<HTMLElement> {
		const dataId = this.top.dom.getId(id);
		return this.$parent?.$el?.querySelector<HTMLElement>(`[data-id=${dataId}]`) || undefined;
	}

	/**
	 * Handler: fold element click
	 *
	 * @param el
	 * @emits fold(target: HTMLElement, el: Doll, value: boolean)
	 */
	protected onFoldingClick(el: Doll): void {
		const
			target = this.searchDollElement(el.id),
			newVal = this.getFoldedMod(<string>el.id) === 'false';

		if (target) {
			this.top.block.setElMod(target, 'matryoshka', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
