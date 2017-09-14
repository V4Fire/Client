'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import bInputHidden from 'form/b-input-hidden/b-input-hidden';
import iInput from 'super/i-input/i-input';
import iData from 'super/i-data/i-data';
import { params, wait } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bForm extends iData {
	/** @override */
	dataProvider: string = 'Provider';

	/** @override */
	requestFilter: Function | boolean = false;

	/**
	 * Form id
	 */
	id: ?string;

	/**
	 * Form name
	 */
	name: ?string;

	/**
	 * Form action
	 */
	action: ?string;

	/**
	 * Data provider method
	 */
	method: ?string = 'add';

	/**
	 * Form delegate function
	 */
	delegate: ?Function;

	/**
	 * Form request parameters
	 */
	params: Object = {};

	/**
	 * If true, then form elements will be cached
	 */
	cache: boolean = false;

	/**
	 * If false, then default error handler won't be used
	 */
	errorHandler: boolean = true;

	/** @override */
	get $refs(): {form: HTMLFormElement} {}

	/** @inheritDoc */
	static mods = {
		valid: [
			'true',
			'false'
		]
	};

	/**
	 * Array of form Vue elements
	 */
	@params({cache: false})
	get elements(): Array<iInput> {
		const cache = {};
		return this.waitState('ready', () => $C(this.$refs.form.elements).reduce((arr, el) => {
			const
				component = this.$(el, '[class*="_form_true"]');

			if (component && component.instance instanceof iInput && !cache[component.blockId]) {
				cache[component.blockId] = true;
				arr.push(component);
			}

			return arr;
		}, []));
	}

	/**
	 * Array of form submit Vue elements
	 */
	@params({cache: false})
	get submits(): Array<bButton> {
		return this.waitState('ready', () => $C(
			this.$el
				.queryAll('button[type="submit"]')
				.concat(this.id ? document.queryAll(`button[type="submit"][form="${this.id}"]`) : [])

		).map((el) => this.$(el)));
	}

	/**
	 * Clears child form blocks
	 * @emits clear()
	 */
	async clear(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/**
	 * Resets child form blocks to default
	 * @emits reset()
	 */
	async reset(): boolean {
		const res = [];
		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch (_) {}
		}

		if ($C(res).some((el) => el)) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * Validates child form blocks and returns an array of valid elements or false
	 *
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail()
	 * @emits validationEnd(result: boolean)
	 */
	@wait('ready', {label: $$.validate, defer: true})
	async validate(): Array | boolean {
		this.emit('validationStart');

		const
			els = [],
			map = {};

		let valid = true;
		for (const el of await this.elements) {
			if (
				el.name && (
					!this.cache || !el.cache || !Object.fastCompare(this.getField(`tmp.${el.name}`), await el.groupFormValue)
				)
			) {
				if (el.mods.valid !== 'true' && await el.validate() === false) {
					el.focus();
					valid = false;
					break;
				}

				if (el.name !== '_') {
					map[el.name] = true;
					els.push(el);
				}
			}
		}

		if (valid) {
			this.emit('validationSuccess');

		} else {
			this.emit('validationFail');
		}

		this.emit('validationEnd', valid);
		return valid && els;
	}

	/**
	 * Submits the form
	 *
	 * @emits submitStart(body: Object, params: Object, method: string)
	 * @emits submitSuccess(result: XMLHttpRequest)
	 * @emits submitFail(err: error, els: Array<iInput>)
	 */
	@wait('ready', {label: $$.submit, defer: true})
	async submit() {
		const
			start = Date.now(),
			[submits, elements] = await Promise.all([this.submits, this.elements]);

		await Promise.all([].concat(
			$C(elements).map((el) => el.setMod('disabled', true)),
			$C(submits).map((el) => el.setMod('progress', true))
		));

		const
			els = await this.validate();

		let
			throws,
			res;

		if (els && els.length) {
			let
				body = {},
				isMultipart = false;

			await Promise.all($C(els).map((el) => (async () => {
				let val = await el.groupFormValue;
				val = el.formConverter ? await el.formConverter(val) : val;

				if (val instanceof Blob || val instanceof File || val instanceof FileList) {
					isMultipart = true;
				}

				body[el.name] = el.utc ? this.h.setJSONToUTC(val) : val;
			})()));

			if (isMultipart) {
				body = $C(body).reduce((res, el, key) => {
					res.append(key, el);
					return res;
				}, new FormData());

				this.params.responseType = 'text';
			}

			this.emit('submitStart', body, this.params, this.method);
			try {
				if (this.delegate) {
					res = await this.delegate(this, body, this.params, els);

				} else {
					res = await this.base(this.action)[this.method](body, this.params);
				}

				this.tmp = Object.assign(this.tmp, body);

			} catch (err) {
				throws = err;
			}
		}

		const
			delay = 0.2.second();

		if (els && Date.now() - start < delay) {
			await this.async.sleep(delay);
		}

		await Promise.all([].concat(
			$C(elements).map((el) => el.setMod('disabled', false)),
			$C(submits).map((el) => el.setMod('progress', false))
		));

		if (!els) {
			return;
		}

		if (throws) {
			this.errorHandler && this.onError(throws, els);
			this.emit('submitFail', throws, els);
			throw throws;
		}

		this.emit('submitSuccess', res, els);
	}

	/**
	 * Default fail handler
	 *
	 * @param err
	 * @param els
	 */
	onError(err: Error, els: Array<Object>) {
		$C(els).forEach((el) => el.setMod('valid', false));

		const
			el = $C(els).one.get((el) => el.instance instanceof bInputHidden === false);

		if (el) {
			el.error = this.getDefaultErrorText(err);
			el.focus();
		}
	}
}

