/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type Friend from 'friends/friend';
import { set } from 'super/i-block/modules/state/helpers';

const
	$$ = symbolGenerator();

/**
 * Saves the component state to its local storage
 * @param [data] - additional data to save
 */
export async function saveToStorage(this: Friend, data?: Dictionary): Promise<boolean> {
	if (this.globalName == null) {
		return false;
	}

	const
		{ctx} = this;

	data = ctx.syncStorageState(data, 'remote');
	set.call(this, ctx.syncStorageState(data));

	await this.storage.set(data, '[[STORE]]');
	ctx.log('state:save:storage', this, data);

	return true;
}

/**
 * Initializes the component state from its local storage
 */
export function initFromStorage(this: Friend): CanPromise<boolean> {
	if (this.globalName == null) {
		return false;
	}

	const
		key = $$.pendingLocalStore;

	if (this[key] != null) {
		return this[key];
	}

	const {
		ctx,
		async: $a
	} = this;

	const storeWatchers = {group: 'storeWatchers'};
	$a.clearAll(storeWatchers);

	return this[key] = $a.promise(async () => {
		const
			data = await this.storage.get('[[STORE]]');

		void this.lfc.execCbAtTheRightTime(() => {
			const
				stateFields = ctx.syncStorageState(data);

			set.call(this, stateFields);

			const sync = $a.debounce(saveToStorage.bind(this), 0, {
				label: $$.syncLocalStorage
			});

			if (Object.isDictionary(stateFields)) {
				for (let keys = Object.keys(stateFields), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						p = key.split('.');

					if (p[0] === 'mods') {
						$a.on(this.localEmitter, `block.mod.*.${p[1]}.*`, sync, storeWatchers);

					} else {
						ctx.watch(key, (val, ...args) => {
							if (!Object.fastCompare(val, args[0])) {
								sync();
							}
						}, {
							...storeWatchers,
							deep: true
						});
					}
				}
			}

			ctx.log('state:init:storage', this, stateFields);
		});

		return true;

	}, {
		group: 'loadStore',
		join: true
	});
}

/**
 * Resets the component local storage state
 */
export async function resetStorage(this: Friend): Promise<boolean> {
	if (this.globalName == null) {
		return false;
	}

	const
		{ctx} = this;

	const
		stateFields = ctx.convertStateToStorageReset();

	set.call(this, stateFields);
	await saveToStorage.call(this);
	ctx.log('state:reset:storage', this, stateFields);

	return true;
}
