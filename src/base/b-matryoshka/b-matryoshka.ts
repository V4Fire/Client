/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-matryoshka/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import iItems from 'traits/i-items/i-items';
import { Doll } from 'base/b-matryoshka/interface';
import iData, { component, prop, field } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';
export * from 'base/b-matryoshka/interface';

export const
	$$ = symbolGenerator();

@component({flyweight: true})
export default class bMatryoshka extends iData implements iItems {
	/** @see [[iItems.prototype.itemsProp]] */
	@prop(Array)
	readonly optionsProp?: Doll[] = [];

	/** @see [[iItems.prototype.items]] */
	@field((o) => o.sync.link())
	options!: Doll[];

	/** @see [[iItems.prototype.item]] */
	@prop({type: [String, Function], required: false})
	readonly option?: iItems['option'];

	/** @see [[iItems.prototype.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly optionKey?: iItems['optionKey'];

	/** @see [[iItems.prototype.itemProps]] */
	@prop({type: Function, required: false})
	readonly optionProps!: iItems['optionProps'];

	/**
	 * Recursively render filter
	 */
	@prop(
		{
			type: Function,
			required: false,
			default(this: bMatryoshka): Promise<boolean> {
				return this.async.animationFrame().then(() => true);
			}
		}
	)

	readonly renderFilter!: (ctx: bMatryoshka, el: Doll) => CanPromise<boolean>;

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
		return this.isFlyweight && <any>this.$normalParent || this;
	}

	/** @override */
	protected initRemoteData(): CanUndef<Doll[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Doll[]>(this.db);

		if (Object.isArray(val)) {
			return this.options = val;
		}

		return this.options;
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

	/** @see [[iItems.getItemKey]] */
	protected getOptionKey(el: unknown, i: number): CanUndef<string> {
		return iItems.getItemKey(this, el, i);
	}

	/**
	 * Returns props data for the specified iterated element
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionProps(el: Doll, i: number): Dictionary {
		const
			op = this.optionProps,
			item = Object.reject(el, 'children');

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (op == null) {
			return item;
		}

		return Object.isFunction(op) ?
			op(item, i, {
				key: this.getOptionKey(item, i),
				ctx: this
			}) :
			op;
	}

	/**
	 * Returns props data for recursive calling
	 */
	protected getNestedDollProps(): Dictionary {
		const opts = {
			folded: this.folded,
			level: this.level + 1,
			classes: this.classes
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

		return this.top.block?.getElMod(target, 'matryoshka', 'folded');
	}

	/**
	 * Searches HTML element with the specified identifier
	 * @param id
	 */
	protected searchDollElement(id: string): CanUndef<HTMLElement> {
		const dataId = this.top.dom.getId(id);
		return this.$parent?.$el?.querySelector<HTMLElement>(`[data-id=${dataId}]`) ?? undefined;
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
			newVal = this.getFoldedMod(el.id) === 'false';

		if (target) {
			this.top.block?.setElMod(target, 'matryoshka', 'folded', newVal);
			this.emit('fold', target, el, newVal);
		}
	}
}
