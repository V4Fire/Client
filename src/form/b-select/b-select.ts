/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { derive } from 'core/functools/trait';

import iItems, { IterationKey } from 'traits/i-items/i-items';
import iOpenToggle from 'traits/i-open-toggle/i-open-toggle';

import iInputText, {

	component,
	prop,
	field,

	ModsDecl

} from 'super/i-input-text/i-input-text';

import type { Item, Items } from 'form/b-select/interface';

export * from 'form/b-input/b-input';
export * from 'traits/i-open-toggle/i-open-toggle';
export * from 'form/b-select/interface';

export const
	$$ = symbolGenerator();

interface bSelect extends Trait<typeof iOpenToggle> {}

@component({
	model: {
		prop: 'selectedProp',
		event: 'onChange'
	}
})

@derive(iOpenToggle)
class bSelect extends iInputText implements iOpenToggle, iItems {
	/** @see [[iItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** @see [[iItems.itemKey]] */
	@prop({
		type: [String, Function],
		default: () => (item: Item) => item.value
	})

	readonly itemKey!: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/**
	 * Icon to show before the input
	 *
	 * @example
	 * ```
	 * < b-select :preIcon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-select :preIconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `preIcon`
	 *
	 * @example
	 * ```
	 * < b-select :preIcon = 'dropdown' | :preIconHint = 'Show variants' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `preIcon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-select &
	 *   :preIcon = 'dropdown' |
	 *   :preIconHint = 'Show variants' |
	 *   :preIconHintPos = 'bottom-right' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon to show after the input
	 *
	 * @example
	 * ```
	 * < b-select :icon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-select :iconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `icon`
	 *
	 * @example
	 * ```
	 * < b-select :icon = 'dropdown' | :iconHint = 'Show variants' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `icon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-select &
	 *   :icon = 'dropdown' |
	 *   :iconHint = 'Show variants' | :
	 *   :iconHintPos = 'bottom-right' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if need to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-select :progressIcon = 'b-my-progress-icon'
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	/**
	 * List of component items or select options
	 * @see [[bSelect.itemsProp]]
	 */
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/**
	 * Sets a new list of component items
	 * @see [[bSelect.items]]
	 */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		opened: [
			...iOpenToggle.mods.opened!,
			['false']
		]
	};

	/** @override */
	@field()
	protected readonly valueKey: string = 'selected';

	/**
	 * Store of component items
	 * @see [[bSelect.items]]
	 */
	@field<bSelect>((o) => o.sync.link<Items>((val) => {
		if (o.dataProvider != null) {
			return <CanUndef<Items>>o.itemsStore ?? [];
		}

		return o.normalizeItems(val);
	}))

	protected itemsStore!: this['Items'];

	/** @override */
	protected readonly $refs!: iInputText['$refs'] & {
		select?: HTMLSelectElement;
	};

	/** @see [[iItems.getItemKey]] */
	protected getItemKey(item: this['Item'], i: number): CanUndef<IterationKey> {
		return iItems.getItemKey(this, item, i);
	}

	/**
	 * Returns true if the specified item is selected
	 * @param item
	 */
	protected isSelected(item: Item): boolean {
		return this.value !== undefined ? item.value === this.value : Boolean(item.selected);
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();
		this.normalizeItems = this.instance.normalizeItems.bind(this);
	}

	/**
	 * Normalizes the specified items and returns it
	 * @param items
	 */
	protected normalizeItems(items: CanUndef<this['Items']>): this['Items'] {
		const
			res = <this['Items']>[];

		if (items == null) {
			return res;
		}

		for (let i = 0; i < items.length; i++) {
			const
				item = items[i];

			res.push({
				...item,
				value: item.value !== undefined ? item.value : item.label
			});
		}

		return res;
	}
}

export default bSelect;
