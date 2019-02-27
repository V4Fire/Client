/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { CreateRequestOpts } from 'super/i-data/i-data';
import { RequestQuery } from 'core/data';
export * from 'super/i-data/i-data';

export interface Add {
	type: 'upd';
	upd: Function;
}

export interface Upd {
	type: 'upd' | 'del';
	upd: Function;
	del: Function;
}

export interface Del {
	type: 'del';
	del: Function;
}

export interface DataList<T> {
	data: T[];
	total: number;
}

export default abstract class iDataList<T extends Dictionary = Dictionary> extends iData<DataList<T>> {
	/**
	 * Converts the specified remote data to the specified component format and returns it
	 *
	 * @param component
	 * @param converter - base converter function
	 * @param data
	 */
	static convertDataToDB<O, T extends iData = iData>(component: T & iDataList, converter: Function, data: unknown): O {
		const
			v = converter.call(component, data);

		if (Object.isFrozen(v)) {
			return v;
		}

		const
			obj = Object.assign(Object.create(<object>v), Object.select(v, ['data', 'total'])),
			list = obj.data;

		if (list) {
			for (let i = 0; i < list.legth; i++) {
				list[i] = component.convertDataChunk(list[i]);
			}
		}

		return obj;
	}

	/**
	 * Converts the specified remote data chunk to the component format and returns it
	 * @param chunk
	 */
	static convertDataChunk(chunk: unknown): unknown {
		return chunk;
	}

	/**
	 * Compares two specified elements
	 *
	 * @param el1
	 * @param el2
	 */
	static compareEls(el1: unknown, el2: unknown): boolean {
		return Object.fastCompare(el1, el2);
	}

	/**
	 * Adds ad data object to the specified component store
	 *
	 * @param component
	 * @param data
	 */
	static addData<T extends iData>(component: T & iDataList, data: unknown): Add {
		return {
			type: 'upd',
			upd: () => {
				if (!component.db) {
					return;
				}

				component.db.total++;
				component.db.data.push(<any>data);
			}
		};
	}

	/**
	 * Updates a data object from the specified component store
	 *
	 * @param component
	 * @param data
	 * @param i - element index
	 */
	static updData<T extends iData>(component: T & iDataList, data: unknown, i: number): Upd {
		const
			c = component;

		return {
			type: 'upd',
			upd: () => {
				if (!c.db) {
					return;
				}

				Object.assign(c.db.data[i], data);
			},

			del: () => {
				if (!c.db) {
					return;
				}

				c.db.total--;
				c.db.data.splice(i, 1);
			}
		};
	}

	/**
	 * Removes a data object from the specified component store
	 *
	 * @param component
	 * @param data
	 * @param i - element index
	 */
	static delData<T extends iData>(component: T & iDataList, data: unknown, i: number): Del {
		const
			c = component;

		return {
			type: 'del',
			del: () => {
				if (!c.db) {
					return;
				}

				c.db.total--;
				c.db.data.splice(i, 1);
			}
		};
	}

	/**
	 * Handler: dataProvider.add
	 *
	 * @param component
	 * @param data
	 */
	static async onAddData<T extends iData>(component: T & iDataList, data: unknown): Promise<void> {
		const
			c = component;

		if (data == null) {
			c.reload().catch(stderr);
			return;
		}

		const list = (<any[]>[]).concat(c.convertDataToDB(data));
		await c.async.wait(() => c.db);

		if (!c.db) {
			return;
		}

		const
			db = c.db.data;

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[i];

			let
				some = false;

			if (db) {
				for (let j = 0; j < db.length; j++) {
					if (c.compareEls(el1, db[j])) {
						some = true;
						break;
					}
				}
			}

			if (!some) {
				const
					mut = c.addData(el1);

				if (mut && mut.type && mut[mut.type]) {
					mut[mut.type].call(c);

				} else {
					return component.reload();
				}
			}
		}
	}

	/**
	 * Handler: dataProvider.upd
	 *
	 * @param component
	 * @param data
	 */
	static async onUpdData<T extends iData>(component: T & iDataList, data: unknown): Promise<void> {
		const
			c = component;

		if (!c.db) {
			return;
		}

		const
			db = c.db.data;

		if (data == null || db == null) {
			c.reload().catch(stderr);
			return;
		}

		const list = (<any[]>[]).concat(c.convertDataToDB(data));
		await c.async.wait(() => c.db);

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[i];

			for (let j = 0; j < db.length; j++) {
				if (c.compareEls(el1, db[j])) {
					const
						mut = c.updData(el1, j);

					if (mut && mut.type && mut[mut.type]) {
						mut[mut.type].call(c);
						break;
					}

					return c.reload();
				}
			}
		}
	}

	/**
	 * Handler: dataProvider.del
	 *
	 * @param component
	 * @param data
	 */
	static async onDelData<T extends iData>(component: T & iDataList, data: unknown): Promise<void> {
		const
			c = component;

		if (!c.db) {
			return;
		}

		const
			db = c.db.data;

		if (data == null || db == null) {
			c.reload().catch(stderr);
			return;
		}

		const list = (<any[]>[]).concat(c.convertDataToDB(data));
		await c.async.wait(() => c.db);

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[i];

			for (let j = 0; j < db.length; j++) {
				if (c.compareEls(el1, db[j])) {
					const
						mut = c.delData(el1, j);

					if (mut && mut.type && mut[mut.type]) {
						mut[mut.type].call(c);
						break;
					}

					return c.reload();
				}
			}
		}
	}

	/** @override */
	abstract get(data?: RequestQuery, params?: CreateRequestOpts<DataList<T>>): Promise<CanUndef<DataList<T>>>;

	/**
	 * Converts the specified remote data chunk to the component format and returns it
	 * @param chunk
	 */
	abstract convertDataChunk(chunk: unknown): T;

	/**
	 * Compares two specified elements
	 *
	 * @param el1
	 * @param el2
	 */
	abstract compareEls(el1: T, el2: T): boolean;

	/**
	 * Adds a data object to the store
	 * @param data
	 */
	abstract addData(data: T): Add;

	/**
	 * Updates a data object from the store
	 *
	 * @param data
	 * @param i - element index
	 */
	abstract updData(data: T, i: number): Upd;

	/**
	 * Removes a data object from the store
	 *
	 * @param data
	 * @param i - element index
	 */
	abstract delData(data: T, i: number): Del;
}
