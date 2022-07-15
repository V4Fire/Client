/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Sync from 'friends/sync/class';
import type { LinkDecl } from 'friends/sync/interface';

/**
 * Synchronizes component reference values with the values they are linked with
 *
 * @param [path] - a path to the property/event we are referring to, or
 *   [a path to the property containing the reference, a path to the property/event we are referring to]
 *
 * @param [value] - the value to synchronize links
 *
 * @example
 * ```typescript
 * import iBlock, { component } from 'super/i-block/i-block';
 * import Sync, { object, syncLinks } from 'friends/sync';
 *
 * Sync.addToPrototype(syncLinks);
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
		linkPath,
		storePath;

	if (Object.isArray(path)) {
		storePath = path[0];
		linkPath = path[1];

	} else {
		linkPath = path;
	}

	const
		cache = this.syncLinkCache;

	const sync = (linkName) => {
		const
			o = cache.get(linkName);

		if (o == null) {
			return;
		}

		for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				el = o[key];

			if (el == null) {
				continue;
			}

			if (storePath == null || key === storePath) {
				el.sync(value ?? this.field.get(linkName));
			}
		}
	};

	if (linkPath != null) {
		sync(linkPath);

	} else {
		for (let o = cache.keys(), el = o.next(); !el.done; el = o.next()) {
			sync(el.value);
		}
	}
}
