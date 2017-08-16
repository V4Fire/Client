'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iDataPages from 'super/i-data-pages/i-data-pages';
import { abstract, field } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bGrid extends iDataPages {
	/**
	 * Sort field
	 */
	sort: string = 'createdDate';

	/**
	 * Sort direction
	 */
	dir: string = 'desc';

	/**
	 * If true, then time from .date wont be skipped
	 */
	keepTime: ?boolean = false;

	/**
	 * Request date
	 */
	date: ?Date | Array<Date>;

	/**
	 * Request date field
	 */
	dateField: ?string = 'createdDate';

	/** @override */
	@field((o) => o.createWatchObject('get', [
		'page',
		'perPage',
		'sort',
		'dir',
		'keepTime',
		['date', (val) => o.h.setJSONToUTC(val)],
		'dateField'
	]))

	requestParams: Object;

	/** @private */
	@abstract
	_activeRows: Object;

	/** @override */
	get $refs(): {loadMore: HTMLTableCellElement} {}

	/**
	 * Activates a row by the specified id
	 *
	 * @param id
	 * @param [node]
	 */
	async activateRow(id: string, node?: Element) {
		if (this._activeRows[id]) {
			return;
		}

		if (node) {
			await this.async.sleep(50);
			if (!node.matches(':hover')) {
				return;
			}
		}

		this._activeRows[id] = true;
	}

	/**
	 * Toggles sort direction
	 * @emits toggleDir(dir: string)
	 */
	toggleDir(): string {
		const dir = this.requestParams.get.dir = {asc: 'desc', desc: 'asc'}[this.requestParams.get.dir];
		this.emit('toggleDir', dir);
		return dir;
	}

	/**
	 * Sets grid sort for the specified field
	 *
	 * @param field
	 * @emits setSort({field: string, dir: string})
	 */
	setSort(field: string): {field: string, dir: string} {
		const
			p = this.requestParams.get;

		if (p.sort === field) {
			this.toggleDir();

		} else {
			p.sort = field;
		}

		const obj = {field, dir: p.dir};
		this.emit('setSort', obj);
		return obj;
	}

	/**
	 * @private
	 * @param date
	 * @param data
	 */
	_checkDateFactory(date: Date | Array<Date>, data: Object): Function {
		return () => {
			const normalizedDate = Object.isDate(date) ? [date] : date;
			return $C(normalizedDate).every((date, i, obj) =>
				$C(['createdDate', 'modifiedDate']).some((field) => {
					let
						d = data[field];

					if (!d) {
						return;
					}

					if (!this.keepTime) {
						date = date.clone().beginningOfDay();
						d = d.short();
					}

					if (obj.length === 1) {
						return date.is(d);
					}

					return date.is(d) || i ? date.isAfter(d) : date.isBefore(d);
				})
			);
		};
	}

	/** @override */
	addData(data: Object): {exec?: Function, type?: string} {
		const
			mut = super.addData(...arguments);

		const
			{date, sort, dir} = this.requestParams.get;

		if ((!sort || {createdDate: true, modifiedDate: true}[sort]) &&
				this._checkDateFactory(date, data)() &&
				(!this.lazyLoad && this.pageIndex !== 1)
		) {
			return {
				...mut,
				type: 'upd',
				upd: () => {
					if (!this.db) {
						return;
					}

					this.db.total++;
					this.db.data[dir === 'asc' ? 'push' : 'unshift'](data);
				}
			};
		}

		return {};
	}

	/* eslint-disable no-unused-vars */

	/** @override */
	updData(data: Object, i: number): {exec?: Function, type?: string} {
		const
			mut = super.updData(...arguments);

		const
			{date, sort} = this.requestParams.get;

		if (sort && !{createdDate: true, modifiedDate: true}[sort] || !this._checkDateFactory(date, data)()) {
			return {...mut, type: 'del'};
		}

		return {...mut, type: 'upd'};
	}

	/* eslint-enable no-unused-vars */

	/** @inheritDoc */
	beforeCreate() {
		this._activeRows = {};
	}

	/** @inheritDoc */
	mounted() {
		this.async.setInterval({
			fn: () => $C(this._activeRows).forEach((val, key) => this.$set(this.renderTmp, key, val)),
			label: $$.checkActiveRows
		}, 0.1.second());
	}
}
