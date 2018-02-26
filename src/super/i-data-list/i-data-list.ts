/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import Then from 'core/then';
import iData, { component, CreateRequestOptions } from 'super/i-data/i-data';
import { RequestQuery } from 'core/data';
export * from 'super/i-data/i-data';

export interface ElComparator {
	(el: any): boolean;
}

export interface DataList<T> {
	data: T[];
	total: number;
}

@component()
export default class iDataList<T extends Dictionary = Dictionary> extends iData<DataList<T>> {
	/** @override */
	readonly needReInit: boolean = true;

	/** @override */
	get(data?: RequestQuery, params?: CreateRequestOptions<DataList<T>>): Then<DataList<T> | null> {
		return super.get(...arguments);
	}

	/** @override */
	protected getObservableData<O>(base: DataList<T>): O | DataList<T> {
		const
			obj = Object.create(base);

		Object.assign(obj, Object.select(base, ['data', 'total']));
		obj.data = $C(obj.data).map((el) => this.getObservableChunk(el));

		return obj;
	}

	/**
	 * Returns an object (chunk) to observe by the specified
	 * @param base
	 */
	protected getObservableChunk(base: T): T {
		return base;
	}

	/**
	 * Returns a function for comparing list elements
	 * @param el - base element for comparing
	 */
	protected getElComparator(el: T): ElComparator {
		return (el2) => el && el._id === el2._id;
	}

	/**
	 * Adds the specified data object to the store
	 * @param data
	 */
	protected addData(data: T): {type: 'upd'; upd: Function} {
		return {
			type: 'upd',
			upd: () => {
				if (!this.db) {
					return;
				}

				this.db.total++;
				this.db.data.push(data);
			}
		};
	}

	/**
	 * Updates the specified data object from the store
	 *
	 * @param data
	 * @param i - element index
	 */
	protected updData(data: T, i: number): {type: 'upd'; upd: Function; del: Function} {
		return {
			type: 'upd',
			upd: () => {
				if (!this.db) {
					return;
				}

				Object.assign(this.db.data[i], data);
			},

			del: () => {
				if (!this.db) {
					return;
				}

				this.db.total--;
				this.db.data.splice(i, 1);
			}
		};
	}

	/**
	 * Removes the specified data object from the store
	 *
	 * @param data
	 * @param i - element index
	 */
	protected delData(data: T, i: number): {type: 'del'; del: Function} {
		return {
			type: 'del',
			del: () => {
				if (!this.db) {
					return;
				}

				this.db.total--;
				this.db.data.splice(i, 1);
			}
		};
	}

	/** @override */
	// @ts-ignore
	protected async onAddData(data: T): Promise<void> {
		const list = (<T[]>[]).concat(data);
		await this.async.wait(() => this.db);

		const
			db = (<DataList<T>>this.db).data;

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[0];

			let some = false;
			for (let i = 0; i < db.length; i++) {
				const
					el2 = db[i];

				if (el1 && el1._id === el2._id) {
					some = true;
					break;
				}
			}

			if (!some) {
				const
					mut = this.addData(this.getObservableChunk(el1));

				if (mut && mut.type && mut[mut.type]) {
					mut[mut.type].call(this);

				} else {
					return this.initLoad();
				}
			}
		}
	}

	/** @override */
	// @ts-ignore
	protected async onUpdData(data: T): Promise<void> {
		const list = (<T[]>[]).concat(data);
		await this.async.wait(() => this.db);

		const
			db = (<DataList<T>>this.db).data;

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[0];

			for (let i = 0; i < db.length; i++) {
				const
					el2 = db[i];

				if (el1 && el1._id === el2._id) {
					const
						mut = this.updData(this.getObservableChunk(el1), i);

					if (mut && mut.type && mut[mut.type]) {
						mut[mut.type].call(this);
						break;
					}

					return this.initLoad();
				}
			}
		}
	}

	/** @override */
	// @ts-ignore
	protected async onDelData(data: T): Promise<void> {
		const list = (<T[]>[]).concat(data);
		await this.async.wait(() => this.db);

		const
			db = (<DataList<T>>this.db).data;

		for (let i = 0; i < list.length; i++) {
			const
				el1 = list[0];

			for (let i = 0; i < db.length; i++) {
				const
					el2 = db[i];

				if (el1 && el1._id === el2._id) {
					const
						mut = this.delData(el1, i);

					if (mut && mut.type && mut[mut.type]) {
						mut[mut.type].call(this);
						break;
					}

					return this.initLoad();
				}
			}
		}
	}
}
