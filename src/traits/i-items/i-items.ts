/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-items/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';
import {

	IterationKey,
	ItemPropsFn,
	CreateFromItemFn

} from 'traits/i-items/interface';

export * from 'traits/i-items/interface';

export default abstract class iItems {
	/**
	 * Returns a value of the unique key (to optimize re-rendering) of the specified item
	 *
	 * @param component
	 * @param item
	 * @param i
	 */
	static getItemKey<T extends iBlock>(
		component: T & iItems,
		item: any,
		i: number
	): CanUndef<IterationKey> {
		const
			{unsafe, itemKey} = component;

		let
			id;

		if (Object.isFunction(itemKey)) {
			id = itemKey.call(component, item, i);

		} else if (Object.isString(itemKey)) {
			const
				cacheKey = `[[FN:${itemKey}]]`;

			let
				compiledFn = <CanUndef<Function>>unsafe.tmp[cacheKey];

			if (!Object.isFunction(compiledFn)) {
				const
					normalize = (str) => str.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

				// eslint-disable-next-line no-new-func
				compiledFn = Function('item', 'i', `return item['${normalize(itemKey)}']`);

				// @ts-ignore (invalid type)
				unsafe.tmp[cacheKey] = compiledFn;
			}

			id = compiledFn.call(component, item, i);
		}

		if (Object.isPrimitive(id)) {
			return id;
		}

		return id != null ? String(id) : id;
	}

	/**
	 * Type: component item
	 */
	abstract readonly Item: object;

	/**
	 * Type: list of component items
	 */
	abstract readonly Items: Array<this['Item']>;

	/**
	 * This prop is used to provide a list of items to render by the component
	 */
	abstract items?: this['Items'];

	/**
	 * By design, the specified items are rendered by using other components.
	 * This prop allows specifying the name of a component that is used to render.
	 * The prop can be provided as a function. In that case, a value is taken from the result of invoking.
	 */
	abstract item?: string | CreateFromItemFn<this['Item'], string>;

	/**
	 * This prop allows specifying props that are passed to a component to render an item.
	 * The prop can be provided as a function. In that case, a value is taken from the result of invoking.
	 */
	abstract itemProps?: Dictionary | ItemPropsFn<this['Item']>;

	/**
	 * To optimize the re-rendering of items, we can specify the unique identifier for each item.
	 * The prop value can be provided as a string or function. In the string case,
	 * you are providing the name of a property that stores the identifier.
	 * If the function case, you should return from the function a value of the identifier.
	 */
	abstract itemKey?: string | CreateFromItemFn<this['Item'], IterationKey>;
}
