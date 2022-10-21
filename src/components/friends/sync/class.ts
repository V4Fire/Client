/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import type iBlock from 'components/super/i-block/i-block';
import type { SyncLinkCache } from 'components/super/i-block/i-block';

import { mod } from 'components/friends/sync/mod';
import { link } from 'components/friends/sync/link';

import type { object } from 'components/friends/sync/object';
import type { syncLinks } from 'components/friends/sync/sync';

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

	/**
	 * Cache for links
	 */
	protected readonly linksCache!: Dictionary<Dictionary>;

	/** @see [[iBlock.$syncLinkCache]] */
	protected get syncLinkCache(): SyncLinkCache {
		return this.ctx.$syncLinkCache;
	}

	/** @see [[iBlock.$syncLinkCache]] */
	protected set syncLinkCache(value: SyncLinkCache) {
		Object.set(this.ctx, '$syncLinkCache', value);
	}

	constructor(component: iBlock) {
		super(component);

		this.linksCache = Object.createDict();
		this.syncModCache = Object.createDict();
		this.syncLinkCache = new Map();
	}
}

Sync.addToPrototype(link, mod);

export default Sync;
