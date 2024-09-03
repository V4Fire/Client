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

import type {

	Link,
	LinkDecl,
	LinkGetter,
	PropLinks,

	AsyncWatchOptions,
	ModValueConverter

} from 'components/friends/sync/interface';

//#if runtime has dummyComponents
import('components/friends/sync/test/b-friends-sync-dummy');
//#endif

interface Sync {
	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		converter?: ModValueConverter<Sync['C'], D, R>
	): void;

	mod<D = unknown, R = unknown>(
		modName: string,
		path: string,
		opts: AsyncWatchOptions,
		converter?: ModValueConverter<Sync['C'], D, R>
	): void;

	link<D = unknown, R = D>(optsOrGetter?: AsyncWatchOptions | LinkGetter<Sync['C'], D, R>): CanUndef<R>;
	link<D = unknown, R = D>(opts: AsyncWatchOptions, getter?: LinkGetter<Sync['C'], D, R>): CanUndef<R>;
	link<D = unknown, R = D>(path: LinkDecl, optsOrGetter?: AsyncWatchOptions | LinkGetter<Sync['C'], D, R>): CanUndef<R>;
	link<D = unknown, R = D>(path: LinkDecl, opts: AsyncWatchOptions, getter?: LinkGetter<Sync['C'], D, R>): CanUndef<R>;

	object(decl: PropLinks): Dictionary;
	object(opts: AsyncWatchOptions, fields: PropLinks): Dictionary;
	// eslint-disable-next-line @typescript-eslint/unified-signatures
	object(path: Link, fields: PropLinks): Dictionary;
	object(path: Link, opts: AsyncWatchOptions, fields: PropLinks): Dictionary;

	syncLinks(path?: LinkDecl, value?: unknown): void;
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

	/**
	 * The index of the last added link
	 */
	protected lastSyncIndex: number = 0;

	/** {@link iBlock.$syncLinkCache} */
	protected get syncLinkCache(): SyncLinkCache {
		return this.ctx.$syncLinkCache;
	}

	/** {@link iBlock.$syncLinkCache} */
	protected set syncLinkCache(value: SyncLinkCache) {
		this.ctx.$syncLinkCache = value;
	}

	constructor(component: iBlock) {
		super(component);

		this.linksCache = Object.createDict();
		this.syncModCache = Object.createDict();
		this.syncLinkCache = new Map();
	}
}

Sync.addToPrototype({link, mod});

export default Sync;
