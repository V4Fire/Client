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
