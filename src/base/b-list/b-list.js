'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iData from 'super/i-data/i-data';
import { field, params, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

export const
	$$ = new Store();

@component()
export default class bList extends iData {
	/** @override */
	model: ?Object = {
		prop: 'valueProp',
		event: 'onChange'
	};

	/**
	 * Initial block value
	 */
	valueProp: Array<Object> = [];

	/**
	 * Initial block active value
	 */
	activeProp: ?any | Array;

	/**
	 * If true, then will be generated href value for a link if it's not existed
	 */
	autoHref: boolean = false;

	/**
	 * If true, then all list labels won't be shown
	 */
	hideLabels: boolean = false;

	/**
	 * If true, then will be enabled multiple value mode
	 */
	multiple: boolean = false;

	/**
	 * If true, then tab activation can be cancel (with multiple = false)
	 */
	cancelable: boolean = false;

	/**
	 * Block value
	 */
	@field((o) => o.link('valueProp', (val) => {
		if (Object.fastCompare(val, o.value)) {
			return o.value || [];
		}

		return val;
	}))

	value: Array<Object>;

	/**
	 * Block active value store
	 */
	@field((o) => o.link('activeProp', (val) => {
		if (o.multiple) {
			const
				objVal = Object.fromArray([].concat(val || []));

			if (Object.fastCompare(objVal, o.activeStore)) {
				return o.activeStore;
			}

			return objVal;
		}

		return Object.fastCompare(val, o.activeStore) ? o.activeStore : val;
	}))

	activeStore: any;

	/**
	 * Block active value synchronization
	 * @emits change(value: ?any)
	 */
	@params({deep: true})
	$$activeStore() {
		this.emit('change', this.active);
	}

	/** @inheritDoc */
	static mods = {
		theme: [
			PARENT,
			'light-vert'
		]
	};

	/**
	 * Undefined value constant
	 */
	static UNDEF = {};

	/**
	 * Block active value
	 */
	get active(): any {
		if (this.activeStore === this.$options.UNDEF) {
			return undefined;
		}

		return this.multiple ? Object.keys(this.activeStore) : this.activeStore;
	}

	/**
	 * Sets a new block active value
	 * @param value
	 */
	set active(value: any) {
		if (this.multiple) {
			if (Object.isArray(value)) {
				if (value[1]) {
					this.$set(this.activeStore, value[0], true);

				} else {
					this.$delete(this.activeStore, value[0]);
				}

			} else {
				this.$set(this.activeStore, value, true);
			}

		} else {
			this.activeStore = value;
		}
	}

	/** @override */
	initRemoteData(): ?any {
		if (!this.db) {
			return;
		}

		const
			val = this.blockConverter ? this.blockConverter(this.db) : this.db;

		if (Object.isArray(val)) {
			return this.value = val;
		}

		return this.value;
	}

	/**
	 * Returns true if the specified link is active
	 *
	 * @param link - link object
	 * @param id - link ID
	 */
	isActive(link: Object, id: number): boolean {
		const a = document.createElement('a');
		a.href = link.href;

		const
			val = link.value !== undefined ? link.value : link.href;

		let isActive;
		if (this.multiple) {
			if (link.active && val in this.activeStore === false) {
				this.active = val;
			}

			isActive = Boolean(this.activeStore[val]);

		} else {
			if (link.active && this.active === undefined) {
				this.active = val;
			}

			isActive = Boolean(this.active !== undefined ? val === this.active : link.active);
		}

		const
			{block: $b} = this;

		if ($b) {
			const el = this.$el.query($b.getElSelector('link', {id}));
			el && $b.setElMod(el, 'link', 'active', isActive);
		}

		return isActive;
	}

	/** @override */
	onPutData(data: Object) {
		Object.assign(this.db, data);
	}

	/** @override */
	onUpdData(data: Object) {
		Object.assign(this.db, data);
	}

	/** @override */
	onDelData(data: Object) {
		Object.assign(this.db, data);
	}

	/**
	 * Handler: tab change
	 *
	 * @param e
	 * @emits actionChange(active: any)
	 */
	onActive(e: Event) {
		const
			val = Object.parse(e.delegateTarget.dataset.value).value;

		if (this.multiple) {
			this.active = this.activeStore[val] ? [val] : val;

		} else {
			if (this.cancelable) {
				if (this.active === val) {
					this.active = this.$options.UNDEF;

				} else {
					this.active = val;
				}

			} else {
				this.active = val;
			}
		}

		this.emit('actionChange', this.active);
	}

	/** @inheritDoc */
	mounted() {
		this.async.on(this.$el, 'click', {
			label: $$.activation,
			fn: this.delegateElement('link', this.onActive)
		});
	}
}
