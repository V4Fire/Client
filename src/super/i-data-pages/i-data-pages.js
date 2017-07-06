'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iDataList from 'super/i-data-list/i-data-list';
import { component } from 'core/component';
import { abstract, field, wait } from 'super/i-block/i-block';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class iDataPages extends iDataList {
	/**
	 * Page number
	 */
	page: number = 1;

	/**
	 * If false, then lazy load for paging will be disabled
	 */
	lazyLoad: ?boolean = true;

	/**
	 * Link to element at the bottom of the data block
	 */
	lazyLoadTrigger: ?Element;

	/**
	 * Data page index
	 */
	@field((o) => o.link('page'))
	pageIndex: number;

	/** @private */
	@abstract
	_pageLoaded: Object;

	/** @override */
	@field((o) => o.createWatchObject('get', ['page']))
	requestParams: Object;

	/** @override */
	get $refs(): {loadPageTrigger: HTMLDivElement} {}

	/** @override */
	async initLoad() {
		await super.initLoad();
		this._pageLoaded = {};
		this.async.clearAll({group: 'loadPage'});
	}

	/**
	 * Loads a data page for the source request
	 *
	 * @param pageNumber
	 * @emits loadNewPage(data: Object)
	 */
	@wait('ready', {label: $$.loadPage, defer: true})
	async loadPage(pageNumber: number) {
		this.setMod('loading', true);

		const
			{db} = this;

		if (!db) {
			return;
		}

		const
			{data} = db;

		if (!data.length || data.length === db.total) {
			return;
		}

		const
			p = this.getParams('get');

		p[0] = $C(p[0]).filter((el) => el != null).map();

		let
			pageIndex = this.pageIndex + 1;

		if (pageNumber) {
			pageIndex = pageNumber;

		} else if (this.pageIndex !== 1) {
			pageIndex = ($C(p[0]).get('page') || 0) + pageIndex;
		}

		if (this._pageLoaded[pageIndex]) {
			return;
		}

		p[0].page = pageIndex;

		if (this.initAdvPath) {
			this.url(this.initAdvPath);
		}

		if (this.lazyLoad) {
			this._pageLoaded[pageIndex] = true;
		}

		const
			res = (await this.get(...p)).responseData;

		if (res.data.length) {
			this.async.requestIdleCallback({
				group: 'loadPage',
				fn: () => {
					const
						data = res.data;

					if (!this.lazyLoad) {
						db.data = [];

					} else {
						this._pageLoaded[pageIndex] = true;
					}

					for (let i = 0; i < data.length; i++) {
						db.data.push(this.getObservableChunk(data[i]));
					}

					db.total = res.total;
					this.pageIndex = pageIndex;
					this.emit('loadNewPage', res);
				}
			});
		}

		this.setMod('loading', false);
	}

	/**
	 * Lazy data load check
	 */
	@wait('ready')
	async checkLazyLoad() {
		await this.waitRef('loadPageTrigger');
		if (innerHeight + pageYOffset >= Math.floor(this.$refs.loadPageTrigger.getPosition().top)) {
			this.async.setTimeout({
				label: $$.checkLazyLoad,
				fn: this.loadPage
			}, 0.3.second());
		}
	}

	/**
	 * Handler: page change
	 *
	 * @param el
	 * @param value
	 */
	async onPageChange(el: bPaging, value: number) {
		await this.loadPage(value);
	}

	/** @inheritDoc */
	mounted() {
		if (this.lazyLoad) {
			this.async.on(document, 'scroll', this.checkLazyLoad);
			this.async.on(window, 'resize', this.checkLazyLoad);
		}
	}
}
