/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import iDataList, { component, prop, field, system, wait, watch } from 'super/i-data-list/i-data-list';
export * from 'super/i-data-list/i-data-list';

export const
	$$ = symbolGenerator();

@component()
export default class iDataPages<T extends Dictionary = Dictionary> extends iDataList<T> {
	/**
	 * Initial page number
	 */
	@prop(Number)
	readonly pageProp: number = 1;

	/**
	 * Document count per page
	 */
	@prop(Number)
	readonly perPage: number = 15;

	/**
	 * If false, then lazy load for paging will be disabled
	 */
	@prop(Boolean)
	readonly lazyLoad: boolean = true;

	/**
	 * Link to an element at the bottom of the data component
	 */
	@prop({type: Element, required: false})
	readonly lazyLoadTrigger?: Element;

	/**
	 * Page number
	 */
	@field((o) => o.link())
	page!: number;

	/** @private */
	@system()
	protected pageLoaded: Dictionary = {};

	/** @override */
	@field((o) => o.createWatchObject('get', ['page']))
	protected readonly requestParams!: Dictionary<Dictionary>;

	/** @override */
	protected readonly $refs!: {loadPageTrigger?: HTMLElement};

	/** @override */
	async initLoad(silent?: boolean): Promise<void> {
		await super.initLoad(silent);
		this.pageLoaded = {};
		this.async.clearAll({group: 'loadPage'});
	}

	/**
	 * Loads a data page for the source request
	 * @emits loadNewPage(data: Object)
	 */
	@wait('ready', {label: $$.loadPage, defer: true})
	async loadPage(): Promise<void> {
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
			p = this.getDefaultRequestParams('get');

		p[0] = $C(p[0]).filter((el) => el != null).map();

		let
			page = this.page + 1;

		if (this.page !== 1) {
			page = ($C(p[0]).get('page') || 0) + page;
		}

		if (this.pageLoaded[page]) {
			return;
		}

		p[0].page = page;
		this.pageLoaded[page] = true;

		const
			res = await this.get(p[0], p[1]);

		if (res && res.data.length) {
			this.async.requestIdleCallback(() => {
				this.pageLoaded[page] = true;

				const
					data = res.data;

				for (let i = 0; i < data.length; i++) {
					db.data.push(this.convertRemoteChunk(data[i]));
				}

				db.total = res.total;
				this.page = page;
				this.emit('loadNewPage', res);

			}, {
				group: 'loadPage'
			});
		}

		this.setMod('loading', false);
	}

	/**
	 * Lazy data load check
	 */
	@wait('ready')
	async checkLazyLoad(): Promise<void> {
		const
			loadPageTrigger = await this.waitRef<HTMLElement>('loadPageTrigger');

		if (innerHeight + pageYOffset >= Math.floor(loadPageTrigger.getPosition().top)) {
			this.async.setTimeout(this.loadPage, 0.3.second(), {label: $$.checkLazyLoad});
		}
	}

	/**
	 * Synchronization for the lazyLoad property
	 * @param value
	 */
	@watch({field: 'lazyLoad', immediate: true})
	protected syncLazyLoadWatcher(value: boolean): void {
		const
			{async: $a} = this,
			group = {group: 'lazyLoad'};

		if (value) {
			$a.on(document, 'scroll', this.checkLazyLoad, group);
			$a.on(window, 'resize', this.checkLazyLoad, group);

		} else {
			$a.off(group);
		}
	}
}
