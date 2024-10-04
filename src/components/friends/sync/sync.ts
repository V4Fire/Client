/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Sync from 'components/friends/sync/class';

import type { LinkDecl, ObjectLink } from 'components/friends/sync/interface';

/**
 * Synchronizes component link values with the values they are linked with
 *
 * @param [path] - a path to the property/event we are referring to, or
 * [a path to the property containing the reference, a path to the property/event we are referring to]
 *
 * @param [value] - the value to synchronize links
 *
 * @example
 * ```typescript
 * import iBlock, { component } from 'components/super/i-block/i-block';
 * import Sync, { object, syncLinks } from 'components/friends/sync';
 *
 * Sync.addToPrototype({syncLinks});
 *
 * @component()
 * export default class bInput extends iBlock {
 *   @prop(String)
 *   valueProp: string = '';
 *
 *   @field((o) => o.sync.link())
 *   value!: string;
 *
 *   created() {
 *     // Synchronize all existing links with their values
 *     this.sync.syncLinks();
 *
 *     // Synchronize all links to `valueProp`
 *     this.sync.syncLinks('valueProp');
 *
 *     // Synchronize all links to `valueProp` and set all values to `'foo'`
 *     this.sync.syncLinks('valueProp', 'foo');
 *
 *     console.log(this.value === 'foo');
 *   }
 * }
 */
export function syncLinks(this: Sync, path?: LinkDecl, value?: unknown): void {
	let
		linkPath: CanUndef<ObjectLink>,
		storePath: CanUndef<string>;

	if (Object.isArray(path)) {
		storePath = path[0];
		linkPath = path[1];

	} else {
		linkPath = path;
	}

	const
		that = this,
		cache = this.syncLinkCache;

	if (linkPath != null) {
		sync(linkPath);

	} else {
		cache.forEach((_, key) => sync(key));
	}

	function sync(linkName: string | object) {
		const o = cache.get(linkName);

		if (o == null) {
			return;
		}

		Object.forEach(Object.entries(o), ([key, el]) => {
			if (el == null) {
				return;
			}

			if (storePath == null || key === storePath) {
				el.sync(value ?? (Object.isString(linkName) ? that.field.get(linkName) : undefined));
			}
		});
	}
}
