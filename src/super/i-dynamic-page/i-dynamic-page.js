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
import Store from 'core/store';

const
	$C = require('collection.js'),
	URI = require('urijs');

export const
	$$ = new Store();

@component()
export default class iDynamicPage extends iData {
	/** @override */
	needReInit: boolean = true;

	/**
	 * Returns an object with default block fields for hash
	 * @param obj
	 */
	convertStateToHash(obj: ?Object): Object {
		return {...obj};
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Gets values from the specified object and saves it to the block state
	 * @param obj
	 */
	setState(obj: Object) {}

	/* eslint-enable no-unused-vars */

	/**
	 * Saves the block state to the location.hash
	 * @param obj - state object
	 */
	setHash(obj: Object): string | false {
		obj = this.convertStateToHash(obj);
		$C(obj).forEach((el, key) => {
			if (el) {
				this[key] = el;
			}
		});

		if (!this.blockActivated) {
			return false;
		}

		const
			hash = Object.toQueryString(Object.remove(obj), {deep: true}),
			url = new URI();

		if (url.fragment()) {
			location.hash = hash;

		} else if (hash) {
			location.replace(url.hash(hash));
		}

		return hash;
	}

	/**
	 * Resets the filter hash
	 */
	resetHash(): string {
		$C(this.convertStateToHash()).forEach((el, key) => this[key] = undefined);
		location.hash = '';
		return '';
	}

	/**
	 * Initialized the block state from hash values
	 */
	initStateFromHash() {
		this.setState(Object.fromQueryString(new URI().fragment(), {deep: true}));
	}

	/**
	 * Accumulates a state for a setting hash
	 * @param obj - state object
	 */
	async accumulateHashState(obj: Object) {
		const
			{tmp} = this;

		if (!tmp.hash) {
			tmp.hash = {};
		}

		Object.assign(tmp.hash, obj);

		try {
			await this.async.sleep(0.22.second(), {label: $$.accumulateHash});
			this.setHash(tmp.hash);
			tmp.hash = {};

		} catch (_) {}
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Handler: filter change
	 *
	 * @param args - tuple:
	 *   1) el - event component
	 *   2) value - component value
	 *   3) [defKey] - default state key
	 *
	 * @param [key] - state key
	 * @param [mixin] - filter mixin
	 * @param [modifier] - value modifier
	 */
	async onFilterChange(args: Object, key?: string = args[2], {mixin = {}, modifier}: {mixin?: Object, modifier?: Function} = {}) {
		let hashData = {};

		if (key) {
			const value = args[1];
			hashData = {[key]: modifier ? modifier(value) : value};
		}

		await this.accumulateHashState({...mixin, ...hashData});
	}

	/* eslint-enable no-unused-vars */

	/** @override */
	activated() {
		this.initStateFromHash();
		this.async.on(window, 'hashchange', this.initStateFromHash);
	}

	/** @override */
	deactivated() {
		this.async.off(window, 'hashchange');
		$C(this.convertStateToHash()).forEach((el, key) => this[key] = undefined);
	}
}
