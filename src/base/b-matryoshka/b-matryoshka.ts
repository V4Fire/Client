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

import { deprecate, deprecated } from 'core/functools';
import bTree, { Item, component, hook } from 'base/b-tree/b-tree';

export * from 'super/i-data/i-data';
export * from 'base/b-matryoshka/interface';

/**
 * @deprecated
 * @see [[bTree]]
 */
@component({flyweight: true})
export default class bMatryoshka extends bTree {
	/**
	 * @deprecated
	 * @see [[iItems.items]]
	 */
	@deprecated({renamedTo: 'items'})
	protected get options(): bTree['items'] {
		return this.items;
	}

	/**
	 * @deprecated
	 * @see [[iItems.option]]
	 */
	@deprecated({renamedTo: 'item'})
	protected get option(): bTree['item'] {
		return this.item;
	}

	/**
	 * Shows a warning that the component marked as obsolete
	 */
	@hook('created')
	protected showDeprecationWarning(): void {
		deprecate({name: 'bMatryoshka', type: 'component', renamedTo: 'bTree'});
	}

	/**
	 * @deprecated
	 * @see [[iItems.getItemProps]]
	 */
	@deprecated({renamedTo: 'getItemProps'})
	protected getOptionProps(el: Item, i: number): Dictionary {
		return this.getItemProps(el, i);
	}
}
