/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-form/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import { Option } from 'core/prelude/structures';
import * as DataProvider from 'components/friends/data-provider';

import iVisible from 'components/traits/i-visible/i-visible';

import type iBlock from 'components/super/i-block/i-block';
import iInput, { FormValue } from 'components/super/i-input/i-input';

import type bButton from 'components/form/b-button/b-button';

import {

	component,
	system,
	wait,

	CreateRequestOptions,
	ModsDecl

} from 'components/super/i-data/i-data';

import bFormProps from 'components/form/b-form/props';
import ValidationError from 'components/form/b-form/error';
import type { ValidateOptions } from 'components/form/b-form/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/form/b-form/interface';

export { ValidationError };

DataProvider.default.addToPrototype(DataProvider);

const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bForm extends bFormProps implements iVisible {
	/**
	 * Additional request parameters
	 * {@link bForm.paramsProp}
	 */
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	@system<bForm>((o) => o.sync.link((val) => Object.assign(o.params ?? {}, val)))
	params!: CreateRequestOptions;

	static override readonly mods: ModsDecl = {
		...iVisible.mods,

		valid: [
			'true',
			'false'
		]
	};

	/**
	 * A list of form related components
	 */
	get elements(): CanPromise<readonly iInput[]> {
		const
			processedComponents: Dictionary<boolean> = Object.createDict();

		return this.waitComponentStatus('ready', () => {
			const
				els: iInput[] = [];

			Object.forEach((<HTMLFormElement>this.$el).elements, (el) => {
				const
					component = this.dom.getComponent<iBlock>(Object.cast(el), '[class*="_form_true"]');

				if (component == null) {
					return;
				}

				if (component.instance instanceof iInput && !processedComponents[component.componentId]) {
					processedComponents[component.componentId] = true;
					els.push(Object.cast(component));
				}
			});

			return Object.freeze(els);
		});
	}

	/**
	 * A list of submit components associated with the form
	 */
	get submits(): CanPromise<readonly bButton[]> {
		return this.waitComponentStatus('ready', () => {
			const
				{$el} = this;

			if ($el == null) {
				return Object.freeze([]);
			}

			let
				list = Array.from($el.querySelectorAll('button[type="submit"]'));

			if (this.id != null) {
				list = list.concat(
					Array.from(document.body.querySelectorAll(`button[type="submit"][form="${this.id}"]`))
				);
			}

			const
				els: bButton[] = [];

			list.forEach((el) => {
				const
					component = this.dom.getComponent<bButton>(el);

				if (component != null) {
					els.push(component);
				}
			});

			return Object.freeze(els);
		});
	}

	/**
	 * Clears the values of all related components
	 * @emits `clear()`
	 */
	async clear(): Promise<boolean> {
		const
			tasks: Array<Promise<boolean>> = [];

		for (const el of await this.elements) {
			try {
				tasks.push(el.clear());
			} catch {}
		}

		for (const res of await Promise.all(tasks)) {
			if (res) {
				this.emit('clear');
				return true;
			}
		}

		return false;
	}

	/**
	 * Resets the values to default for all related components
	 * @emits `reset()`
	 */
	async reset(): Promise<boolean> {
		const
			tasks: Array<Promise<boolean>> = [];

		for (const el of await this.elements) {
			try {
				tasks.push(el.reset());
			} catch {}
		}

		for (const res of await Promise.all(tasks)) {
			if (res) {
				this.emit('reset');
				return true;
			}
		}

		return false;
	}

	/**
	 * Validates the values of all related components and returns:
	 *
	 * 1. `ValidationError` - if the validation fails;
	 * 2. A list of components to send - if the validation was successful.
	 *
	 * @param [opts] - additional validation options
	 *
	 * @emits `validationStart()`
	 * @emits `validationSuccess()`
	 * @emits `validationFail(failedValidation:` [[ValidationError]]`)`
	 * @emits `validationEnd(result: boolean, failedValidation: CanUndef<`[[ValidationError]]`>)`
	 */
	@wait('ready', {defer: true, label: $$.validate})
	async validate(opts: ValidateOptions = {}): Promise<iInput[] | ValidationError> {
		this.emit('validationStart');

		const
			values = Object.createDict(),
			toSubmit: iInput[] = [];

		let
			valid = true,
			failedValidation;

		for (const el of await this.elements) {
			const
				elName = el.name;

			const needSubmit =
				elName == null ||

				!this.cache || !el.cache ||
				!this.tmp.hasOwnProperty(elName) ||

				!Object.fastCompare(
					this.tmp[elName],
					values[elName] ?? (values[elName] = await this.getElementValueToSubmit(el))
				);

			if (!needSubmit) {
				continue;
			}

			const
				canValidate = el.mods.valid !== 'true',
				validation = canValidate && await el.validate();

			if (canValidate && !Object.isBoolean(validation)) {
				if (opts.focusOnError) {
					try {
						await el.focus();
					} catch {}
				}

				failedValidation = new ValidationError(el, validation);
				valid = false;
				break;
			}

			if (Object.isTruly(el.name)) {
				toSubmit.push(el);
			}
		}

		if (valid) {
			this.emit('validationSuccess');
			this.emit('validationEnd', true);

		} else {
			this.emitError('validationFail', failedValidation);
			this.emit('validationEnd', false, failedValidation);
		}

		if (!valid) {
			return failedValidation;
		}

		return toSubmit;
	}

	/**
	 * Submits the form
	 *
	 * @emits `submitStart(body:` [[SubmitBody]]`, ctx:` [[SubmitCtx]]`)`
	 * @emits `submitSuccess(response: unknown, ctx:` [[SubmitCtx]]`)`
	 * @emits `submitFail(err: Error |` [[RequestError]]`, ctx:` [[SubmitCtx]]`)`
	 * @emits `submitEnd(result:` [[SubmitResult]]`, ctx:` [[SubmitCtx]]`)`
	 */
	@wait('ready', {defer: true, label: $$.submit})
	async submit<D = unknown>(): Promise<D> {
		const start = Date.now();
		await this.toggleControls(true);

		const validation = await this.validate({
			focusOnError: true
		});

		const toSubmit = Object.isArray(validation) ?
			validation :
			[];

		const submitCtx = {
			elements: toSubmit,
			form: this
		};

		let
			submitErr,
			formResponse;

		if (toSubmit.length === 0) {
			this.emit('submitStart', {}, submitCtx);

			if (!Object.isArray(validation)) {
				submitErr = validation;
			}

		} else {
			const body = await this.getValues(toSubmit);
			this.emit('submitStart', body, submitCtx);

			try {
				if (Object.isFunction(this.action)) {
					formResponse = await this.action(body, submitCtx);

				} else {
					let
						{dataProvider} = this;

					if (dataProvider == null) {
						throw new ReferenceError('Missing data provider to send data');
					}

					if (!Object.isFunction(dataProvider[this.method])) {
						throw new ReferenceError(`The specified request method "${this.method}" does not exist in the data provider`);
					}

					if (this.action != null) {
						dataProvider = dataProvider.base(this.action);
					}

					if (!Object.isFunction(dataProvider[this.method])) {
						throw new ReferenceError(`The specified request method "${this.method}" does not exist in the data provider`);
					}

					formResponse = await dataProvider[this.method](body, this.params);
				}

				Object.assign(this.tmp, body);

				const
					delay = 0.2.second();

				if (Date.now() - start < delay) {
					await this.async.sleep(delay);
				}

			} catch (err) {
				submitErr = err;
			}
		}

		await this.toggleControls(false);

		try {
			if (submitErr != null) {
				this.emitError('submitFail', submitErr, submitCtx);
				throw submitErr;
			}

			if (toSubmit.length > 0) {
				this.emit('submitSuccess', formResponse, submitCtx);
			}

		} finally {
			let
				status = 'success';

			if (submitErr != null) {
				status = 'fail';

			} else if (toSubmit.length === 0) {
				status = 'empty';
			}

			const event = {
				status,
				response: submitErr != null ? submitErr : formResponse
			};

			this.emit('submitEnd', event, submitCtx);
		}

		return formResponse;
	}

	/**
	 * Returns the values of related components, grouped by name
	 * @param [validate] - if true, the method only returns values when the data is valid
	 */
	async getValues(validate?: ValidateOptions | boolean): Promise<Dictionary<CanArray<FormValue>>>;

	/**
	 * Returns the values of the specified input components, grouped by name
	 * @param elements
	 */
	async getValues(elements: iInput[]): Promise<Dictionary<CanArray<FormValue>>>;
	async getValues(validateOrElements?: ValidateOptions | iInput[] | boolean): Promise<Dictionary<CanArray<FormValue>>> {
		let
			els;

		if (Object.isArray(validateOrElements)) {
			els = validateOrElements;

		} else {
			els = Object.isTruly(validateOrElements) ?
				await this.validate(Object.isBoolean(validateOrElements) ? {} : validateOrElements) :
				await this.elements;
		}

		if (Object.isArray(els)) {
			const
				body = {};

			for (const el of (<iInput[]>els)) {
				const
					elName = el.name ?? '';

				if (elName === '' || body.hasOwnProperty(elName)) {
					continue;
				}

				const
					val = await this.getElementValueToSubmit(el);

				if (val !== undefined) {
					body[elName] = val;
				}
			}

			return body;
		}

		return {};
	}

	/**
	 * Returns the value to send from the specified element
	 * @param el
	 */
	protected async getElementValueToSubmit(el: iInput): Promise<unknown> {
		if (!Object.isTruly(el.name)) {
			return undefined;
		}

		let
			val: unknown = await el.groupFormValue;

		for (const converter of el.formConverters) {
			const
				newVal = converter(val, this);

			if (newVal instanceof Option) {
				val = await newVal.catch(() => undefined);

			} else {
				val = await newVal;
			}
		}

		return val;
	}

	/**
	 * Toggles the progress/enable statuses of related form controls
	 * @param disable
	 */
	protected async toggleControls(disable: boolean): Promise<void> {
		const
			[submits, els] = await Promise.all([this.submits, this.elements]);

		const
			tasks: Array<CanPromise<boolean>> = [];

		els.forEach((el) => {
			tasks.push(el.setMod('disabled', disable));
		});

		submits.forEach((el) => {
			tasks.push(el.setMod('progress', disable));
		});

		try {
			await Promise.all(tasks);
		} catch {}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
