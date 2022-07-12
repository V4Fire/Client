/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'friends/friend';

import type iBlock from 'super/i-block/i-block';
import type { SyncLinkCache } from 'super/i-block/i-block';

import { mod } from 'friends/sync/mod';
import { link } from 'friends/sync/link';

import type { object } from 'friends/sync/object';
import type { syncLinks } from 'friends/sync/sync';

import type { AsyncWatchOptions } from 'friends/sync/interface';

interface Sync {
	mod: typeof mod;
	link: typeof link;
	object: typeof object;
	syncLinks: typeof syncLinks;
}

@fakeMethods('object')
class Sync extends Friend {
	/**
	 * Cache of functions to synchronize modifiers
	 */
	readonly syncModCache!: Dictionary<Function>;

	/** @see [[iBlock.$syncLinkCache]] */
	protected get syncLinkCache(): SyncLinkCache {
		return this.ctx.$syncLinkCache;
	}

	/** @see [[iBlock.$syncLinkCache]] */
	protected set syncLinkCache(value: SyncLinkCache) {
		Object.set(this.ctx, '$syncLinkCache', value);
	}

	/**
	 * Cache for links
	 */
	protected readonly linksCache!: Dictionary<Dictionary>;

	constructor(component: iBlock) {
		super(component);

		this.linksCache = Object.createDict();

		this.syncLinkCache = new Map();
		this.syncModCache = Object.createDict();
	}

	/**
	 * Wrapper of `Object.fastCompare` to compare watchable values
	 *
	 * @param value
	 * @param oldValue
	 * @param destPath - path to the property
	 * @param opts - watch options
	 */
	protected fastCompare(
		value: unknown,
		oldValue: unknown,
		destPath: string,
		opts: AsyncWatchOptions
	): boolean {
		if (opts.collapse === false) {
			return value === oldValue;
		}

		return !opts.withProto && (
			Object.fastCompare(value, oldValue) &&
			Object.fastCompare(value, this.field.get(destPath))
		);
	}
}

Sync.addToPrototype(link, mod);

export default Sync;
