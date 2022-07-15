/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type Storage from 'friends/storage/class';

/**
 * Returns a value from the storage by the specified key
 *
 * @param [key]
 * @param [args] - additional arguments for the storage
 */
export function get<T extends object = Dictionary>(
	this: Storage,
	key: string = '',
	...args: unknown[]
): Promise<CanUndef<T>> {
	const
		label = `${this.globalName}_${key}`;

	return this.engine.get(label, {
		label,
		group: 'storage:load',
		join: true
	}, ...args);
}

/**
 * Saves a value to the storage by the specified key
 *
 * @param value
 * @param [key]
 * @param [args] - additional arguments for the storage
 */
export function set<T extends object = Dictionary>(
	this: Storage,
	value: T,
	key: string = '',
	...args: unknown[]
): Promise<void> {
	const
		label = `${this.globalName}_${key}`;

	return this.engine.set(label, value, {
		label,
		group: 'storage:save',
		join: 'replace'
	}, ...args);
}

/**
 * Removes a value from the storage by the specified key
 *
 * @param [key]
 * @param [args] - additional arguments for the storage
 */
export function remove(this: Storage, key: string = '', ...args: unknown[]): Promise<void> {
	const
		label = `${this.globalName}_${key}`;

	return this.engine.remove(label, {
		label,
		group: 'storage:remove',
		join: 'replace'
	}, ...args);
}
