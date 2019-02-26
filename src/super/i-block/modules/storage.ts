/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';

//#if runtime has core/kv-storage
import { asyncLocal, AsyncNamespace, ClearFilter } from 'core/kv-storage';
//#endif

export default class Storage {
	/**
	 * Component unique name
	 */
	get globalName(): CanUndef<string> {
		return this.component.globalName;
	}

	/**
	 * Storage engine object
	 */
	readonly engine: CanUndef<AsyncNamespace>;

	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * Async instance
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * Link to a component log function
	 */
	protected get log(): typeof iBlock.prototype['log'] {
		// @ts-ignore
		return this.component.log;
	}

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;

		//#if runtime has core/has kv-storage
		this.engine = asyncLocal.namespace(component.componentName);
		//#endif
	}

	/**
	 * Returns a value from a storage by the specified key
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
					this.log('storage:load', () => Object.fastClone(res));
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
	 * Saves a value to a storage by the specified key
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
					this.log('storage:save', () => Object.fastClone(value));
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
	 * Removes a value from a storage by the specified key
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
					this.log('storage:remove', id);
				}

			} catch {}

		}, {
			label: id,
			group: 'storage:remove',
			join: 'replace'
		});
	}
}
