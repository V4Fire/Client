/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-form/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/form';
//#endif

import symbolGenerator from 'core/symbol';

import { Option } from 'core/prelude/structures';
import { deprecated } from 'core/functools/deprecation';

//#if runtime has core/data
import 'core/data';
//#endif

import iVisible from 'traits/i-visible/i-visible';
import iInput, { FormValue } from 'super/i-input/i-input';

import type bButton from 'form/b-button/b-button';

import iData, {

	component,
	prop,
	system,
	wait,

	ModelMethod,
	RequestFilter,
	CreateRequestOptions,

	ModsDecl

} from 'super/i-data/i-data';

import ValidationError from 'form/b-form/modules/error';
import type { ActionFn, ValidateOptions } from 'form/b-form/interface';

export * from 'super/i-data/i-data';
export * from 'form/b-form/interface';

export { ValidationError };

export const
	$$ = symbolGenerator();

/**
 * Component to create a form
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bForm extends iData implements iVisible {
	override readonly dataProvider: string = 'Provider';
	override readonly defaultRequestFilter: RequestFilter = true;

	/**
	 * A form identifier.
	 * You can use it to connect the form with components that lay "outside"
	 * from the form body (by using the `form` attribute).
	 *
	 * @example
	 * ```
	 * < b-form :id = 'my-form'
	 * < b-input :form = 'my-form'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly id?: string;

	/**
	 * A form name.
	 * You can use it to find the form element via `document.forms`.
	 *
	 * @example
	 * ```
	 * < b-form :name = 'my-form'
	 * ```
	 *
	 * ```js
	 * console.log(document.forms['my-form']);
	 * ```
	 */
	@prop({type: String, required: false})
	readonly name?: string;

	/**
	 * A form action URL (the URL where the data will be sent) or a function to create action.
	 * If the value is not specified, the component will use the default URL-s from the data provider.
	 *
	 * @example
	 * ```
	 * < b-form :action = '/create-user'
	 * < b-form :action = createUser
	 * ```
	 */
	@prop({type: [String, Function], required: false})
	readonly action?: string | ActionFn;

	/**
	 * Data provider method which is invoked on the form submit
	 *
	 * @example
	 * ```
	 * < b-form :dataProvider = 'User' | :method = 'upd'
	 * ```
	 */
	@prop(String)
	readonly method: ModelMethod = 'post';

	/**
	 * Additional form request parameters
	 *
	 * @example
	 * ```
	 * < b-form :params = {headers: {'x-foo': 'bla'}}
	 * ```
	 */
	@prop(Object)
	readonly paramsProp: CreateRequestOptions = {};

	/**
	 * If true, then form elements is cached.
	 * The caching is mean that if some component value doesn't change since the last sending of the form,
	 * it won't be sent again.
	 *
	 * @example
	 * ```
	 * < b-form :dataProvider = 'User' | :method = 'upd' | :cache = true
	 *   < b-input :name = 'fname'
	 *   < b-input :name = 'lname'
	 *   < b-input :name = 'bd' | :cache = false
	 *   < b-button :type = 'submit'
	 * ```
	 */
	@prop(Boolean)
	readonly cache: boolean = false;

	/**
	 * Additional request parameters
	 * @see [[bForm.paramsProp]]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	@system<bForm>((o) => o.sync.link((val) => Object.assign(o.params ?? {}, val)))
	params!: CreateRequestOptions;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,

		valid: [
			'true',
			'false'
		]
	};

	/**
	 * List of components that are associated with the form
	 */
	get elements(): CanPromise<readonly iInput[]> {
		const
			processedComponents: Dictionary<boolean> = Object.createDict();

		return this.waitStatus('ready', () => {
			const
				els = <iInput[]>[];

			for (let o = Array.from((<HTMLFormElement>this.$el).elements), i = 0; i < o.length; i++) {
				const
					component = this.dom.getComponent<iInput>(o[i], '[class*="_form_true"]');

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				if (component == null) {
					continue;
				}

				if (component.instance instanceof iInput && !processedComponents[component.componentId]) {
					processedComponents[component.componentId] = true;
					els.push(component);
				}
			}

			return Object.freeze(els);
		});
	}

	/**
	 * List of components to submit that are associated with the form
	 */
	get submits(): CanPromise<readonly bButton[]> {
		return this.waitStatus('ready', () => {
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
				els = <bButton[]>[];

			for (let i = 0; i < list.length; i++) {
				const
					component = this.dom.getComponent<bButton>(list[i]);

				if (component != null) {
					els.push(component);
				}
			}

			return Object.freeze(els);
		});
	}

	/**
	 * Clears values of all associated components
	 * @emits `clear()`
	 */
	async clear(): Promise<boolean> {
		const
			tasks = <Array<Promise<boolean>>>[];

		for (const el of await this.elements) {
			try {
				tasks.push(el.clear());
			} catch {}
		}

		for (let o = await Promise.all(tasks), i = 0; i < o.length; i++) {
			if (o[i]) {
				this.emit('clear');
				return true;
			}
		}

		return false;
	}

	/**
	 * Resets values to defaults of all associated components
	 * @emits `reset()`
	 */
	async reset(): Promise<boolean> {
		const
			tasks = <Array<Promise<boolean>>>[];

		for (const el of await this.elements) {
			try {
				tasks.push(el.reset());
			} catch {}
		}

		for (let o = await Promise.all(tasks), i = 0; i < o.length; i++) {
			if (o[i]) {
				this.emit('clear');
				return true;
			}
		}

		return false;
	}

	/**
	 * Validates values of all associated components and returns:
	 *
	 * 1. `ValidationError` - if the validation is failed;
	 * 2. List of components to send - if the validation is successful.
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
			toSubmit = <iInput[]>[];

		let
			valid = true,
			failedValidation;

		for (let o = await this.elements, i = 0; i < o.length; i++) {
			const
				el = o[i],
				elName = el.name;

			const needValidate =
				elName == null ||

				!this.cache || !el.cache ||
				!this.tmp.hasOwnProperty(elName) ||

				!Object.fastCompare(this.tmp[elName], values[elName] ?? (values[elName] = await this.getElValueToSubmit(el)));

			if (needValidate) {
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

		const
			validation = await this.validate({focusOnError: true});

		const
			toSubmit = Object.isArray(validation) ? validation : [];

		const submitCtx = {
			elements: toSubmit,
			form: this
		};

		let
			operationErr,
			formResponse;

		if (toSubmit.length === 0) {
			this.emit('submitStart', {}, submitCtx);

			if (!Object.isArray(validation)) {
				operationErr = validation;
			}

		} else {
			const body = await this.getValues(toSubmit);
			this.emit('submitStart', body, submitCtx);

			try {
				if (Object.isFunction(this.action)) {
					formResponse = await this.action(body, submitCtx);

				} else {
					const providerCtx = this.action != null ? this.base(this.action) : this;
					formResponse = await (<Function>providerCtx[this.method])(body, this.params);
				}

				Object.assign(this.tmp, body);

				const
					delay = 0.2.second();

				if (Date.now() - start < delay) {
					await this.async.sleep(delay);
				}

			} catch (err) {
				operationErr = err;
			}
		}

		await this.toggleControls(false);

		try {
			if (operationErr != null) {
				this.emitError('submitFail', operationErr, submitCtx);
				throw operationErr;
			}

			if (toSubmit.length > 0) {
				this.emit('submitSuccess', formResponse, submitCtx);
			}

		} finally {
			let
				status = 'success';

			if (operationErr != null) {
				status = 'fail';

			} else if (toSubmit.length === 0) {
				status = 'empty';
			}

			const event = {
				status,
				response: operationErr != null ? operationErr : formResponse
			};

			this.emit('submitEnd', event, submitCtx);
		}

		return formResponse;
	}

	/**
	 * Returns values of the associated components grouped by names
	 * @param [validate] - if true, the method returns values only when the data is valid
	 */
	async getValues(validate?: ValidateOptions): Promise<Dictionary<CanArray<FormValue>>>;

	/**
	 * Returns values of the specified iInput components grouped by names
	 * @param elements
	 */
	async getValues(elements: iInput[]): Promise<Dictionary<CanArray<FormValue>>>;
	async getValues(validateOrElements?: ValidateOptions | iInput[]): Promise<Dictionary<CanArray<FormValue>>> {
		let
			els;

		if (Object.isArray(validateOrElements)) {
			els = validateOrElements;

		} else {
			els = Object.isTruly(validateOrElements) ? await this.validate(validateOrElements) : await this.elements;
		}

		if (Object.isArray(els)) {
			const
				body = {};

			for (let i = 0; i < els.length; i++) {
				const
					el = <iInput>els[i],
					elName = el.name ?? '';

				if (elName === '' || body.hasOwnProperty(elName)) {
					continue;
				}

				const
					val = await this.getElValueToSubmit(el);

				if (val !== undefined) {
					body[elName] = val;
				}
			}

			return body;
		}

		return {};
	}

	/**
	 * @deprecated
	 * @see [[bForm.getValues]]
	 */
	@deprecated({renamedTo: 'getValues'})
	async values(validate?: ValidateOptions): Promise<Dictionary<CanArray<FormValue>>> {
		return this.getValues(validate);
	}

	/**
	 * Returns a value to submit from the specified element
	 * @param el
	 */
	protected async getElValueToSubmit(el: iInput): Promise<unknown> {
		if (!Object.isTruly(el.name)) {
			return undefined;
		}

		let
			val = await el.groupFormValue;

		if (el.formConverter != null) {
			const
				converters = Array.concat([], el.formConverter);

			for (let i = 0; i < converters.length; i++) {
				const
					validation = converters[i].call(this, val, this);

				if (validation instanceof Option) {
					val = await validation.catch(() => undefined);

				} else {
					val = await validation;
				}
			}
		}

		return val;
	}

	/**
	 * Toggles statuses of the form controls
	 * @param freeze - if true, all controls are freeze
	 */
	protected async toggleControls(freeze: boolean): Promise<void> {
		const
			[submits, els] = await Promise.all([this.submits, this.elements]);

		const
			tasks = <Array<CanPromise<boolean>>>[];

		for (let i = 0; i < els.length; i++) {
			tasks.push(els[i].setMod('disabled', freeze));
		}

		for (let i = 0; i < submits.length; i++) {
			tasks.push(submits[i].setMod('progress', freeze));
		}

		try {
			await Promise.all(tasks);

		} catch {}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
