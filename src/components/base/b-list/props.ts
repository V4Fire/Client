/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iItems from 'components/traits/i-items/i-items';
import type iActiveItems from 'components/traits/i-active-items/i-active-items';

import iData, { prop, component } from 'components/super/i-data/i-data';

import type { Item } from 'components/base/b-list/b-list';

@component()
export default abstract class bListProps extends iData {
	/** @see [[iActiveItems.Item]] */
	readonly Item!: Item;

	/** @see [[iItems.Items]] */
	readonly Items!: Array<this['Item']>;

	/** @see [[iActiveItems.ActiveProp]] */
	readonly ActiveProp!: iActiveItems['ActiveProp'];

	/** @see [[iActiveItems.Active]] */
	readonly Active!: iActiveItems['Active'];

	/** @see [[iItems.items]] */
	@prop(Array)
	readonly itemsProp: this['Items'] = [];

	/** @see [[iItems.item]] */
	@prop({type: [String, Function], required: false})
	readonly item?: iItems['item'];

	/** @see [[iActiveItems.activeProp]] */
	@prop({required: false})
	readonly activeProp?: this['ActiveProp'];

	/** @see [[iActiveItems.activeProp]] */
	@prop({required: false})
	readonly modelValue?: this['ActiveProp'];

	/** @see [[iActiveItems.multiple]] */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/** @see [[iActiveItems.cancelable]] */
	@prop({type: Boolean, required: false})
	readonly cancelable?: boolean;

	/** @see [[iItems.itemKey]] */
	@prop({type: [String, Function], required: false})
	readonly itemKey?: iItems['itemKey'];

	/** @see [[iItems.itemProps]] */
	@prop({type: Function, required: false})
	readonly itemProps?: iItems['itemProps'];

	/** @see [[iVisible.hideIfOffline]] */
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
}
