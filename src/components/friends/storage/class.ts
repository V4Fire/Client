/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { asyncLocal, factory } from 'core/kv-storage';
import type { WrappedAsyncStorageNamespace } from 'core/async';

import Friend from 'components/friends/friend';
import type iBlock from 'components/super/i-block/i-block';

import * as api from 'components/friends/storage/api';

interface Storage {
	get<T extends object = Dictionary>(key?: string, ...args: unknown[]): Promise<CanUndef<T>>;
	set<T extends object = Dictionary>(value: T, key?: string, ...args: unknown[]): Promise<void>;
	remove(key?: string, ...args: unknown[]): Promise<void>;
}

class Storage extends Friend {
	/**
	 * The used storage engine
	 */
	readonly engine: WrappedAsyncStorageNamespace;

	/**
	 * @param component
	 * @param [engine] - a storage engine to use
	 */
	constructor(component: iBlock, engine?: Dictionary) {
		super(component);

		this.engine = this.async.wrapStorage(
			(engine ? factory(engine, true) : asyncLocal).namespace(component.componentName)
		);
	}
}

Storage.addToPrototype(api);

export default Storage;
