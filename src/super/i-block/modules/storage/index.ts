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

import iBlock from 'super/i-block/i-block';
import Friend from 'super/i-block/modules/friend';

//#if runtime has core/kv-storage
import { asyncLocal, factory, AsyncNamespace } from 'core/kv-storage';
//#endif

/**
 * Class to work with a local storage
 */
export default class Storage<C extends iBlock = iBlock> extends Friend<C> {
	//#if runtime has core/kv-storage

	/** @see [[iBlock.globalName]] */
	get globalName(): this['C']['globalName'] {
		return this.component.globalName;
	}

	/**
	 * Storage engine
	 */
	readonly engine: CanUndef<AsyncNamespace>;

	/**
	 * @override
	 * @param component
	 * @param [engine] - custom engine
	 */
	constructor(component: T, engine?: Dictionary) {
		super(component);

		//#if runtime has core/kv-storage
		this.engine = (engine ? factory(engine, true) : asyncLocal).namespace(component.componentName);
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
					this.component.log('storage:load', () => Object.fastClone(res));
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
					this.component.log('storage:save', () => Object.fastClone(value));
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
					this.component.log('storage:remove', id);
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
