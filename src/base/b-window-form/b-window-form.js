'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bWindow from 'base/b-window/b-window';
import { field, params, wait } from 'super/i-block/i-block';
import { list2Map } from 'core/helpers';
import { component } from 'core/component';

@component()
export default class bWindowForm extends bWindow {
	/** @override */
	dbConverter: ?Function = list2Map;

	/** @override */
	stageProp: ?string;

	/** @override */
	@params({default(body, isEmpty) {
		return this.stage !== 'remove' && !isEmpty;
	}})

	requestFilter: Function | boolean = false;

	/**
	 * If true, then the component won't be reset after closing
	 */
	singleton: boolean = false;

	/**
	 * Initial requested id
	 */
	idProp: ?string;

	/**
	 * Method name
	 */
	method: ?string;

	/** @override */
	@field((o) => o.createWatchObject('get', [['_id', 'id']], {immediate: true}))
	requestParams: Object;

	/**
	 * Requested id
	 */
	@field((o) => o.link('idProp'))
	id: ?string;

	/**
	 * Form temporary cache
	 */
	@field()
	formTmp: Object = {};

	/** @override */
	get $refs(): {form: bForm} {}

	/**
	 * Method name
	 */
	get methodName(): string {
		let m = this.method;

		if (!m) {
			switch (this.stage) {
				case 'edit':
					if (this.id) {
						m = 'upd';
					}

					break;

				case 'remove':
					m = 'del';
					break;

				default:
					m = 'add';
					break;
			}
		}

		return m;
	}

	/** @override */
	initDataListeners() {}

	/**
	 * Clears the block form
	 * @emits clear()
	 */
	@wait('ready')
	async clear(): boolean {
		if (await this.$refs.form.clear()) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/**
	 * Resets the block form
	 * @emits reset()
	 */
	@wait('ready')
	async reset(): boolean {
		if (await this.$refs.form.reset()) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/** @override */
	async close(): boolean {
		const
			res = await super.close();

		if (res && !this.singleton) {
			if (await this.reset() || this.db) {
				this.formTmp = {};
				this.id = undefined;
				this.db = null;
			}
		}

		return res;
	}
}
