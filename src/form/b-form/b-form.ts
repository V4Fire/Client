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

import symbolGenerator from 'core/symbol';

import { Option } from 'core/prelude/structures';
import { deprecate, deprecated } from 'core/functools/deprecation';

//#if runtime has core/data
import 'core/data';
//#endif

import iVisible from 'traits/i-visible/i-visible';
import iInput, { FormValue } from 'super/i-input/i-input';

//#if runtime has bButton
import bButton from 'form/b-button/b-button';
//#endif

import iData, {

	component,
	field,
	prop,
	wait,

	ModelMethod,
	RequestFilter,
	CreateRequestOptions,

	ModsDecl

} from 'super/i-data/i-data';

import { ActionFn, ValidateOptions, ValidationError } from 'form/b-form/interface';

export * from 'super/i-data/i-data';
export * from 'form/b-form/interface';

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
	/** @override */
	readonly dataProvider: string = 'Provider';

	/** @override */
	readonly defaultRequestFilter: RequestFilter = true;

	/**
	 * Form identifier.
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
	 * Form name.
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
	 * Form action URL (the URL where the data will be sent) or a function to create action.
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
	 */
	@prop(Boolean)
	readonly cache: boolean = false;

	/**
	 * Additional request parameters
	 * @see [[bForm.paramsProp]]
	 */
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	@field<bForm>((o) => o.sync.link((val) => Object.assign(o.params ?? {}, val)))
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
			cache = Object.createDict();

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

				if (component.instance instanceof iInput && cache[component.componentId] == null) {
					cache[component.componentId] = true;
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
				els.push(this.dom.getComponent(list[i]));
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
	 * Resets values to the default of all associated components
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
	 * * `ValidationError` - if the validation is failed;
	 * * List of components to send - if the validation is successful.
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
			elsToSubmit = <iInput[]>[],
			elValues = Object.createDict();

		let
			valid = true,
			failedValidation;

		for (let o = await this.elements, i = 0; i < o.length; i++) {
			const
				el = o[i],
				elName = el.name;

			const needValidate =
				elName == null ||

				!this.cache ||
				!el.cache ||

				!Object.fastCompare(
					this.field.get(`tmp.${elName}`),
					elValues[elName] ?? (elValues[elName] = await el.groupFormValue)
				);

			if (needValidate) {
				const
					canValidate = el.mods.valid !== 'true',
					validation = canValidate && await el.validate();

				if (canValidate && validation !== true) {
					if (opts.focusOnError) {
						try {
							await el.focus();
						} catch {}
					}

					failedValidation = {
						component: el,
						error: validation,

						get el() {
							deprecate({name: 'el', type: 'property', renamedTo: 'component'});
							return el;
						},

						get validator() {
							deprecate({name: 'validator', type: 'property', renamedTo: 'error'});
							return validation;
						}
					};

					valid = false;
					break;
				}

				if (Object.isTruly(el.name)) {
					elsToSubmit.push(el);
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

		return elsToSubmit;
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
	async submit(): Promise<void> {
		const
			start = Date.now();

		await this.toggleControls(true);

		const
			validation = await this.validate({focusOnError: true}),
			elsToSubmit = Object.isArray(validation) ? validation : [];

		const submitCtx = {
			elements: elsToSubmit,
			form: this
		};

		let
			operationErr,
			formResponse;

		if (elsToSubmit.length === 0) {
			this.emit('submitStart', {}, submitCtx);

			if (!Object.isArray(validation)) {
				operationErr = validation;
			}

		} else {
			let
				body = {},
				isMultipart = false;

			const
				tasks = <Array<Promise<unknown>>>[];

			for (let i = 0; i < elsToSubmit.length; i++) {
				const
					el = elsToSubmit[i],
					key = el.name ?? '';

				if (body.hasOwnProperty(key)) {
					continue;
				}

				tasks.push((async () => {
					const
						val = await this.getElValueToSubmit(el);

					if (val === undefined) {
						return;
					}

					if (val instanceof Blob || val instanceof File || val instanceof FileList) {
						isMultipart = true;
					}

					body[key] = val;
				})());
			}

			await Promise.all(tasks);

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (isMultipart) {
				const
					form = new FormData();

				for (let keys = Object.keys(body), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						el = body[key];

					if (el instanceof Blob) {
						form.append(key, el, `blob.${el.type.split('/')[1]}`);

					} else {
						form.append(key, el);
					}
				}

				body = form;
				this.params.responseType = 'text';
			}

			this.emit('submitStart', body, submitCtx);

			try {
				if (Object.isFunction(this.action)) {
					formResponse = await this.action(body, submitCtx);

				} else {
					let
						that = this;

					if (this.action != null) {
						that = this.base(this.action);
					}

					formResponse = await (<Function>that[this.method])(body, this.params);
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

			if (elsToSubmit.length > 0) {
				this.emit('submitSuccess', formResponse, submitCtx);
			}

		} finally {
			let
				status = 'success';

			if (operationErr != null) {
				status = 'fail';

			} else if (elsToSubmit.length === 0) {
				status = 'empty';
			}

			const submitRes = {
				status,
				response: operationErr != null ? operationErr : formResponse
			};

			this.emit('submitEnd', submitRes, submitCtx);
		}
	}

	/**
	 * Returns values of associated components grouped by names
	 * @param [validate] - if true, the method returns values only when the data is valid
	 */
	async getValues(validate?: ValidateOptions): Promise<Dictionary<CanArray<FormValue>>> {
		const
			els = validate ? await this.validate(validate) : await this.elements;

		if (Object.isArray(els)) {
			const
				body = {},
				tasks = <Array<Promise<unknown>>>[];

			for (let i = 0; i < els.length; i++) {
				const
					el = <iInput>els[i],
					key = el.name ?? '';

				if (body.hasOwnProperty(key)) {
					continue;
				}

				tasks.push((async () => {
					const
						val = await this.getElValueToSubmit(el);

					if (val !== undefined) {
						body[key] = val;
					}
				})());
			}

			await Promise.all(tasks);
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
	 * Returns a value to submit of the specified element
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
					validation = converters[i].call(this, val);

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
	 * Toggles the status of form controls
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

		await Promise.all(tasks);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
