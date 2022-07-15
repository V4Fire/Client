/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { asyncLocal, factory } from 'core/kv-storage';
import type { WrappedAsyncStorageNamespace } from 'core/async';

import Friend from 'friends/friend';
import type iBlock from 'super/i-block/i-block';

import * as api from 'friends/storage/api';

interface Storage {
	get: typeof api.get;
	set: typeof api.set;
	remove: typeof api.remove;
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
