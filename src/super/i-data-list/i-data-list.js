'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData from 'super/i-data/i-data';
import { component } from 'core/component';

const
	$C = require('collection.js');

@component()
export default class iDataList extends iData {
	/** @override */
	needReInit: boolean = true;

	/** @override */
	getObservableData(base: Object): Object {
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
	getObservableChunk(base: Object): Object {
		return base;
	}

	/**
	 * Returns a function for comparing list elements
	 * @param el - base element for comparing
	 */
	getElComparator(el: Object): Function {
		return (el2) => el && el._id === el2._id;
	}

	/**
	 * Adds the specified data object to the store
	 * @param data
	 */
	addData(data: Object): {exec?: Function, type?: string} {
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
	updData(data: Object, i: number): {exec?: Function, type?: string} {
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
	delData(data: Object, i: number): {exec?: Function, type?: string} {
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
	async onAddData(data: Object) {
		await this.async.wait(() => this.db);

		if (!$C(this.db.data).some(this.getElComparator(data))) {
			const
				mut = this.addData(this.getObservableChunk(data));

			if (mut && mut.type && mut[mut.type]) {
				mut[mut.type].call(this);

			} else {
				this.initLoad();
			}
		}
	}

	/** @override */
	async onUpdData(data: Object) {
		await this.async.wait(() => this.db);

		$C(this.db.data).forEach((el, i, obj, o) => {
			const
				mut = this.updData(this.getObservableChunk(data), i);

			if (mut && mut.type && mut[mut.type]) {
				mut[mut.type].call(this);

			} else {
				this.initLoad();
			}

			return o.break;

		}, {filter: this.getElComparator(data)});
	}

	/** @override */
	async onDelData(data: Object) {
		await this.async.wait(() => this.db);

		// FIXME: replace to for...of
		$C(this.db.data).forEach((el, i, obj, o) => {
			const
				mut = this.delData(data, i);

			if (mut && mut.type && mut[mut.type]) {
				mut[mut.type].call(this);

			} else {
				this.initLoad();
			}

			return o.break;

		}, {filter: this.getElComparator(data)});
	}
}
