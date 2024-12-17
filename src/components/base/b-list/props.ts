/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'components/traits/i-items/i-items';
import type iActiveItems from 'components/traits/i-active-items/i-active-items';
import type iVisible from 'components/traits/i-visible/i-visible';

import iData, { prop, component } from 'components/super/i-data/i-data';

import type { Item } from 'components/base/b-list/b-list';

@component({partial: 'bList'})
export default abstract class iListProps extends iData {
	/** {@link iActiveItems.Item} */
	readonly Item!: Item;

	/** {@link iItems.Items} */
	readonly Items!: Array<this['Item']>;

	/** {@link iActiveItems.ActiveProp} */
	readonly ActiveProp!: iActiveItems['ActiveProp'];

	/** {@link iActiveItems.Active} */
	readonly Active!: iActiveItems['Active'];

	/** {@link iItems.items} */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** {@link iItems.item} */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** {@link iActiveItems.activeProp} */
	@prop({required: false})
	readonly activeProp?: this['ActiveProp'];

	/** {@link iActiveItems.activeProp} */
	@prop({required: false})
	readonly modelValue?: this['ActiveProp'];

	/** {@link iActiveItems.multiple} */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** {@link iActiveItems.cancelable} */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/** {@link iItems.itemKey} */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** {@link iItems.itemProps} */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/** {@link iVisible.hideIfOffline} */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * List root tag type
	 */
	@prop(String)
	readonly listTag: string = 'ul';

	/**
	 * List element tag type
	 */
	@prop(String)
	readonly listElementTag: string = 'li';

	/**
	 * If true, then all elements without the `href` option will automatically generate a link using `value`
	 * and other props
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * Additional attributes that are provided to the native list tag
	 */
	@prop({type: Object, required: false})
	readonly attrsProp?: Dictionary;

	/**
	 * If true, then `.g-hint` will be added to the link elements
	 */
	@prop(Boolean)
	readonly hints: boolean = true;
}
