/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type Friend from 'components/friends/friend';
import { set } from 'components/friends/state/helpers';

const
	$$ = symbolGenerator();

/**
 * Initializes the component state from its local storage.
 * This method is required for `syncStorageState` to work.
 */
export function initFromStorage(this: Friend): CanPromise<boolean> {
	const that = this;

	if (this.globalName == null) {
		return false;
	}

	const key = $$.pendingLocalStore;

	if (this[key] != null) {
		return this[key];
	}

	const {ctx, async: $a} = this;

	const storeWatchers = {group: 'storeWatchers'};
	$a.clearAll(storeWatchers);

	return this[key] = $a.promise(loadFromStorage, {
		group: 'loadStore',
		join: true
	});

	function loadFromStorage(): Promise<boolean> {
		return ctx.storage.get('[[STORE]]').then((data) => {
			void ctx.lfc.execCbAtTheRightTime(syncWithState);
			return true;

			function syncWithState() {
				const stateFields = ctx.syncStorageState(data);
				set.call(that, stateFields);

				const sync = $a.debounce(saveToStorage.bind(that), 0, {
					label: $$.syncLocalStorage
				});

				if (Object.isDictionary(stateFields)) {
					Object.keys(stateFields).forEach((key) => {
						const p = key.split('.');

						if (p[0] === 'mods') {
							$a.on(ctx.localEmitter, `block.mod.*.${p[1]}.*`, sync, storeWatchers);

						} else {
							ctx.watch(key, (val: unknown, ...args: unknown[]) => {
								if (!Object.fastCompare(val, args[0])) {
									sync();
								}
							}, {
								...storeWatchers,
								deep: true
							});
						}
					});
				}

				ctx.log('state:init:storage', that, stateFields);
			}
		});
	}
}

/**
 * Saves the component state to its local storage.
 * The data to save is taken from the component `syncStorageState` method.
 * Also, you can pass additional parameters.
 *
 * @param [data] - additional data to save
 */
export async function saveToStorage(this: Friend, data?: Dictionary): Promise<boolean> {
	if (this.globalName == null) {
		return false;
	}

	const {ctx} = this;

	data = ctx.syncStorageState(data, 'remote');
	set.call(this, ctx.syncStorageState(data));

	await this.storage.set(data, '[[STORE]]');
	ctx.log('state:save:storage', this, data);

	return true;
}

/**
 * Resets the component local storage state.
 * The function takes the result of `convertStateToStorageReset` and maps it to the component.
 */
export async function resetStorage(this: Friend): Promise<boolean> {
	if (this.globalName == null) {
		return false;
	}

	const {ctx} = this;

	const stateFields = ctx.convertStateToStorageReset();
	set.call(this, stateFields);

	await saveToStorage.call(this);
	ctx.log('state:reset:storage', this, stateFields);

	return true;
}
