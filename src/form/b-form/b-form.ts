/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import bInputHidden from 'form/b-input-hidden/b-input-hidden';
import iInput, { ValidationError as InputValidationError } from 'super/i-input/i-input';
import bButton from 'form/b-button/b-button';
import iData, {

	component,
	field,
	prop,
	wait,
	p,
	ModsDecl,
	ModelMethods,
	CreateRequestOptions,
	RequestFilter

} from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

export interface ValidationError<V = unknown> {
	el: iInput;
	validator: InputValidationError<V>;
}

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bForm<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly requestFilter: RequestFilter = false;

	/**
	 * Form id
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * Form name
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * Form action
	 */
	@prop({type: String, required: false})
	readonly action?: string;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethods = 'add';

	/**
	 * Form delegate function
	 */
	@prop({type: Function, required: false})
	readonly delegateAction?: Function;

	/**
	 * Form request parameters
	 */
	@prop(Object)
	readonly paramsProp: CreateRequestOptions = {};

	/**
	 * If true, then form elements will be cached
	 */
	@prop(Boolean)
	readonly cache: boolean = false;

	/**
	 * If false, then default error handler won't be used
	 */
	@prop(Boolean)
	readonly errorHandler: boolean = true;

	/**
	 * Form request parameters store
	 */
	// tslint:disable-next-line:prefer-object-spread
	@field<bForm>((o) => o.link((val) => Object.assign(o.params || {}, val)))
	params!: CreateRequestOptions;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		valid: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {form: HTMLFormElement};

	/**
	 * Array of form components
	 */
	@p({cache: false})
	get elements(): CanPromise<ReadonlyArray<iInput>> {
		const cache = {};
		return this.waitStatus('ready', () => {
			const els = $C(this.$refs.form.elements).to([] as iInput[]).reduce((arr, el) => {
				const
					component = this.$<iInput>(el, '[class*="_form_true"]');

				if (component && component.instance instanceof iInput && !cache[component.componentId]) {
					cache[component.componentId] = true;
					arr.push(component);
				}

				return arr;
			});

			return Object.freeze(els);
		});
	}

	/**
	 * Array of form submit components
	 */
	@p({cache: false})
	get submits(): CanPromise<ReadonlyArray<bButton>> {
		return this.waitStatus('ready', () => {
			const els = $C(
				Array.from(this.$el.querySelectorAll('button[type="submit"]')).concat(
					this.id ? Array.from(document.body.querySelectorAll(`button[type="submit"][form="${this.id}"]`)) : []
				)

			).map((el) => <bButton>this.$(el));

			return Object.freeze(els);
		});
	}

	/**
	 * Clears child form blocks
	 * @emits clear()
	 */
	async clear(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.clear());
			} catch {}
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
	async reset(): Promise<boolean> {
		const
			res = <boolean[]>[];

		for (const el of await this.elements) {
			try {
				res.push(await el.reset());
			} catch {}
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
	 * @param [focusOnFail] - if true, then will be set focus to an invalid element
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail(failedValidation: ValidationError)
	 * @emits validationEnd(result: boolean, failedValidation: CanUndef<ValidationError>)
	 */
	@wait('ready', {label: $$.validate, defer: true})
	async validate(focusOnFail?: boolean): Promise<iInput[] | false> {
		this.emit('validationStart');

		const
			els = <iInput[]>[],
			map = {};

		let
			valid = true,
			failedValidation;

		for (const el of await this.elements) {
			if (
				el.name && (
					!this.cache ||
					!el.cache ||
					!Object.fastCompare(this.getField(`tmp.${el.name}`), await el.groupFormValue)
				)
			) {
				const
					canValidate = el.mods.valid !== 'true',
					validation = canValidate && await el.validate();

				if (canValidate && validation !== true) {
					if (focusOnFail) {
						try {
							await el.focus();
						} catch {}
					}

					failedValidation = {el, validator: validation};
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
			this.emit('validationFail', failedValidation);
		}

		this.emit('validationEnd', valid, failedValidation);
		return valid && els;
	}

	/**
	 * Submits the form
	 *
	 * @emits submitStart(body: RequestBody, params: CreateRequestOptions<T>, method: string)
	 * @emits submitSuccess(result: T)
	 * @emits submitFail(err: Error, els: iInput[])
	 */
	@wait('ready', {label: $$.submit, defer: true})
	async submit(): Promise<void> {
		const
			start = Date.now(),
			// @ts-ignore
			[submits, elements] = await Promise.all([this.submits, this.elements]);

		await Promise.all((<CanPromise<boolean>[]>[]).concat(
			$C(elements).map((el) => el.setMod('disabled', true)),
			$C(submits).map((el) => el.setMod('progress', true))
		));

		const
			els = await this.validate(true);

		let
			throws,
			res;

		if (els && els.length) {
			let
				body = {},
				isMultipart = false;

			await Promise.all($C(els as iInput[]).map((el) => (async () => {
				let val = await el.groupFormValue;
				val = el.formConverter ? await el.formConverter(val) : val;

				if (val instanceof Blob || val instanceof File || val instanceof FileList) {
					isMultipart = true;
				}

				if (el.name) {
					body[el.name] = el.utc && Object.isObject(val) ? this.h.setJSONToUTC(val) : val;
				}
			})()));

			if (isMultipart) {
				body = $C(body).reduce((res, el, key) => {
					if (el instanceof Blob) {
						res.append(key, el, `blob.${el.type.split('/')[1]}`);

					} else {
						res.append(key, el);
					}

					return res;
				}, new FormData());

				this.params.responseType = 'text';
			}

			this.emit('submitStart', body, this.params, this.method);

			try {
				if (this.delegateAction) {
					res = await this.delegateAction(this, body, this.params, els);

				} else {
					if (this.action) {
						this.base(this.action);
					}

					res = await (<Function>this[this.method])(body, this.params);
				}

				Object.assign(this.tmp, body);

			} catch (err) {
				throws = err;
			}
		}

		const
			delay = 0.2.second();

		if (els && Date.now() - start < delay) {
			await this.async.sleep(delay);
		}

		await Promise.all((<CanPromise<boolean>[]>[]).concat(
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.localEvent.on('block.mod.*.valid.*', ({type, value}) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = undefined;
			}
		});
	}

	/**
	 * Default fail handler
	 *
	 * @param err
	 * @param els
	 */
	protected async onError(err: Error, els: iInput[]): Promise<void> {
		$C(els).forEach((el) => el.setMod('valid', false));

		const
			el = $C(els).one.get((el) => !(el.instance instanceof bInputHidden));

		if (el) {
			el.error = this.getDefaultErrorText(err);
			await el.focus();
		}
	}
}
