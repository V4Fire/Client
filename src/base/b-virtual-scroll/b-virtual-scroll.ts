import iData, { component, prop, field, wait, system, watch, p, hook } from 'super/i-data/i-data';
export * from 'super/i-block/i-block';

export type OptionProps = ((el: unknown, i: number) => Dictionary) | Dictionary;
export type OptionsIterator<T = bVirtualScroll> = (options: unknown[], ctx: T) => unknown[];

@component()
export default class bVirtualScroll<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Initial component options
	 */
	@prop(Array)
	readonly optionsProp?: unknown[] = [];

	/**
	 * Factory for an options iterator
	 */
	@prop({type: Function, required: false})
	optionsIterator?: OptionsIterator;

	/**
	 * Component options
	 */
	@field((o) => o.sync.link())
	options!: unknown[];

	/**
	 * Option unique key (for v-for)
	 */
	@prop({type: [String, Function]})
	readonly optionKey!: string | ((el: unknown, i: number) => string);

	/**
	 * Option component
	 */
	@prop({type: String})
	readonly option!: string;

	/**
	 * Option component props
	 */
	@prop({type: [Object, Function]})
	readonly optionProps: OptionProps = {};

	/**
	 * Number of real DOM elements
	 */
	@prop({
		type: Number,
		validator: (v: number) => v.isNatural()
	})
	readonly realElementsSize: number = 20;

	/**
	 * Number of cached VNodes
	 */
	@prop({
		type: Number,
		validator: (v: number) => v.isNatural()
	})
	readonly cacheSize: number = 100;

	/**
	 * Number of recycle VNodes per chunk
	 */
	@prop({
		type: Number,
		validator: (v: number) => v.isNatural()
	})
	readonly recycleSize: number = 10;

	/**
	 * If true, created VNodes will be recycled
	 */
	@prop(Boolean)
	readonly recycleVNode: boolean = false;

	/**
	 * Should use tombstone while loading
	 */
	@prop({type: Boolean})
	readonly tombstone: boolean = false;

	/**
	 * Scrolls to specified element
	 * @param index
	 */
	@wait('ready')
	async scrollToEl(index: number): Promise<void> {
		return;
	}

	/**
	 * Scrolls to specified position
	 * @param value
	 */
	@wait('ready')
	async scrollTo(value: number): Promise<void> {
		return;
	}

	/**
	 * Generates or returns an option key for v-for
	 *
	 * @param el
	 * @param i
	 */
	protected getOptionKey(el: unknown, i: number): CanUndef<string> {
		return Object.isFunction(this.optionKey) ?
			this.optionKey(el, i) :
			this.optionKey;
	}

	/**
	 * Handler: element click
	 *
	 * @param el
	 * @param i
	 *
	 * @emits elClick(el: unknown, i: number)
	 */
	protected onElClick(el: unknown, i: number): void {
		this.emit('elClick', el, i);
	}
}
