'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iInput from 'super/i-input/i-input';
import { field, bindModTo } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bTimeRange extends iInput {
	/** @override */
	@field((o) => o.link('valueProp', (val) => {
		if (Object.fastCompare(val, o.valueStore)) {
			return o.valueStore;
		}

		return val;
	}))

	valueStore: ?Object;

	/** @override */
	get $refs(): {input: HTMLInputElement} {}

	/** @inheritDoc */
	static mods = {
		@bindModTo('valueStore', (v, o) => !o.getField('from.length', v) && !o.getField('to.length', v))
		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	get value(): Object {
		return Object.fastClone(this.valueStore);
	}

	/** @override */
	async clear(): boolean {
		if (this.mods.empty !== 'true') {
			return super.clear();
		}

		return false;
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Handler: clear
	 *
	 * @param e
	 * @emits actionChange(value: string)
	 */
	async onClear(e: MouseEvent) {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
			await this.focus();
		}
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Handler: block value save
	 * @emits actionChange(value: ?Object)
	 */
	async onSave() {
		const
			get = (s) => $C(this.block.elements(s)).map((el) => this.$(el).formValue),
			from = await Promise.all(get('input-from')),
			to = await Promise.all(get('input-to'));

		function f(arr) {
			if (arr[0] == null && arr[1] == null) {
				arr.splice(0, 2);
				return;
			}

			arr[0] = arr[0] || 0;
			arr[1] = arr[1] || 0;
		}

		f(from);
		f(to);

		this.value = from.length || to.length ? {from, to} : undefined;
		this.emit('actionChange', this.value);
		await this.close();
	}

	/* @override */
	created() {
		this.initCloseHelpers();
	}
}
