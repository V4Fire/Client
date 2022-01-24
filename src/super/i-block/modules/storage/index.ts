/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/storage/README.md]]
 * @packageDocumentation
 */

//#if runtime has core/kv-storage
import { asyncLocal, factory, AsyncStorageNamespace } from '@src/core/kv-storage';
//#endif

import type iBlock from '@src/super/i-block/i-block';
import Friend from '@src/super/i-block/modules/friend';

/**
 * Class to work with a local storage
 */
export default class Storage extends Friend {
	//#if runtime has core/kv-storage

	/**
	 * Storage engine
	 */
	readonly engine: CanUndef<AsyncStorageNamespace>;

	/**
	 * @param component
	 * @param [engine] - custom engine
	 */
	constructor(component: iBlock, engine?: Dictionary) {
		super(component);

		//#if runtime has core/kv-storage
		this.engine = (engine ? factory(engine, true) : asyncLocal).namespace(component.componentName);
		//#endif
	}

	/**
	 * Returns a value from the storage by the specified key
	 *
	 * @param [key]
	 * @param [args]
	 */
	get<T extends object = Dictionary>(key: string = '', ...args: unknown[]): Promise<CanUndef<T>> {
		const
			id = `${this.globalName}_${key}`;

		return this.async.promise(async () => {
			try {
				const
					{engine} = this;

				if (engine) {
					const res = await engine.get<T>(id, ...args);
					this.ctx.log('storage:load', () => Object.fastClone(res));
					return res;
				}

			} catch {}

		}, {
			label: id,
			group: 'storage:load',
			join: true
		});
	}

	/**
	 * Saves a value to the storage by the specified key
	 *
	 * @param value
	 * @param [key]
	 * @param [args]
	 */
	set<T extends object = Dictionary>(value: T, key: string = '', ...args: unknown[]): Promise<T> {
		const
			id = `${this.globalName}_${key}`;

		return this.async.promise(async () => {
			try {
				const
					{engine} = this;

				if (engine) {
					await engine.set(id, value, ...args);
					this.ctx.log('storage:save', () => Object.fastClone(value));
				}

			} catch {}

			return value;

		}, {
			label: id,
			group: 'storage:save',
			join: 'replace'
		});
	}

	/**
	 * Removes a value from the storage by the specified key
	 *
	 * @param [key]
	 * @param [args]
	 */
	remove(key: string = '', ...args: unknown[]): Promise<void> {
		const
			id = `${this.globalName}_${key}`;

		return this.async.promise(async () => {
			try {
				const
					{engine} = this;

				if (engine) {
					await engine.remove(id, ...args);
					this.ctx.log('storage:remove', id);
				}

			} catch {}

		}, {
			label: id,
			group: 'storage:remove',
			join: 'replace'
		});
	}

	//#endif
}
