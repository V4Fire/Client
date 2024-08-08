/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { is } from 'core/browser';
import type iItems from 'components/traits/i-items/i-items';
import type iActiveItems from 'components/traits/i-active-items/i-active-items';

import iInputText, { component, prop } from 'components/super/i-input-text/i-input-text';
import type { Value, FormValue, Item } from 'components/form/b-select/interface';

@component({partial: 'b-select'})
export default abstract class iSelectProps extends iInputText {
	override readonly Value!: Value;

	override readonly FormValue!: FormValue;

	/** {@link iItems.Item} */
	readonly Item!: Item;

	/** {@link iItems.Items} */
	readonly Items!: Array<this['Item']>;

	/** {@link iActiveItems.ActiveProp} */
	readonly ActiveProp!: iActiveItems['ActiveProp'];

	/** {@link iActiveItems.Active} */
	readonly Active!: iActiveItems['Active'];

	override readonly valueProp?: this['ActiveProp'];

	/**
	 * @alias valueProp
	 * {@link iActiveItems.activeProp}
	 */
	@prop({required: false})
	readonly activeProp?: this['ActiveProp'];

	/** {@link iItems.items} */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** {@link iItems.item} */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** {@link iItems.itemKey} */
	@prop({
		type: [String, Function],
		default: () => (item: Item) => item.value
	})

	readonly itemKey!: iItems['itemKey'];

	/** {@link iItems.itemProps} */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/**
	 * If true, the component supports a feature of multiple selected items
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** {@link iActiveItems.cancelable} */
	@prop({type: Boolean})
	readonly cancelable: boolean = true;

	/**
	 * If true, the component will use a native tag to show the select
	 */
	@prop(Boolean)
	readonly native: boolean = Object.isTruly(is.mobile);

	/**
	 * An icon to show before the button text
	 *
	 * @example
	 * ```
	 * < b-select :preIcon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * The name of the used component to display `preIcon`
	 *
	 * @example
	 * ```
	 * < b-select :preIconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text to display when hovering over `preIcon`
	 *
	 * @example
	 * ```
	 * < b-select &
	 *   :preIcon = 'dropdown' |
	 *   :preIconHint = 'Show variants' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position to display when hovering over `preIcon`
	 *
	 * @see gHint
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
	 * An icon to show after the button text
	 *
	 * @example
	 * ```
	 * < b-select :icon = 'dropdown' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * The name of the used component to display `icon`
	 *
	 * @example
	 * ```
	 * < b-select :iconComponent = 'b-my-icon' | :items = myItems
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text to display when hovering over `icon`
	 *
	 * @example
	 * ```
	 * < b-select &
	 *   :icon = 'dropdown' |
	 *   :iconHint = 'Show variants' |
	 *   :items = myItems
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position to display when hovering over `icon`
	 *
	 * @see gHint
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
	 * Boolean, if needed to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-select :progressIcon = 'b-my-progress-icon' | :items = myItems
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;
}
