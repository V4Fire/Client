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

import { deprecate } from 'core/functools';

import iItems from 'traits/i-items/i-items';
import bTree, { component, hook } from 'base/b-tree/b-tree';

export * from 'super/i-data/i-data';
export * from 'base/b-matryoshka/interface';

/**
 * @deprecated
 * @see [[bTree]]
 */
@component({flyweight: true})
export default class bMatryoshka extends bTree implements iItems {
	@hook('created')
	protected showDeprecatedWarning(): void {
		deprecate({name: 'bPrice', type: 'component', renamedTo: 'bMoney'});
	}
}
