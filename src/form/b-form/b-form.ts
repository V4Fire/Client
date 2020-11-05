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

//#if runtime has core/data
import 'core/data';
//#endif

import iVisible from 'traits/i-visible/i-visible';
import iInput, { FormValue, ValidationError } from 'super/i-input/i-input';

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

import { ActionFn, ValidateOptions } from 'form/b-form/interface';

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

export default class bForm extends iData {
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
	readonly method: ModelMethod = 'add';

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

	/** @override */
	protected readonly $refs!: {form: HTMLFormElement};

	/**
	 * List of components that are associated with the form
	 */
	get elements(): CanPromise<readonly iInput[]> {
		const
			cache = Object.createDict();

		return this.waitStatus('ready', () => {
			const
				els = <iInput[]>[];

			for (let o = Array.from(this.$refs.form.elements), i = 0; i < o.length; i++) {
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
				el = o[i];

			const
				{name} = el;

			if (name == null || name === '') {
				continue;
			}

			const needValidate =
				!this.cache ||
				!el.cache ||

				!Object.fastCompare(
					this.field.get(`tmp.${name}`),
					elValues[name] ?? (elValues[name] = await el.groupFormValue)
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

					failedValidation = {el, validator: validation};
					valid = false;
					break;
				}

				if (name !== '_') {
					elsToSubmit.push(el);
				}
			}
		}

		if (valid) {
			this.emit('validationSuccess');

		} else {
			this.emitError('validationFail', failedValidation);
		}

		this.emit('validationEnd', valid, failedValidation);

		if (!valid) {
			return failedValidation;
		}

		return elsToSubmit;
	}

	/**
	 * Submits the form
	 *
	 * @emits submitStart(body: SubmitBody, ctx: SubmitCtx)
	 * @emits submitSuccess(result: T, ctx: SubmitCtx)
	 * @emits submitFail(err: Error, ctx: SubmitCtx)
	 */
	@wait('ready', {defer: true, label: $$.submit})
	async submit(): Promise<void> {
		const
			start = Date.now(),
			[submits, els] = await Promise.all([this.submits, this.elements]);

		{
			const
				elTasks = <Array<CanPromise<boolean>>>[],
				submitTasks = <Array<CanPromise<boolean>>>[];

			for (let i = 0; i < els.length; i++) {
				elTasks.push(els[i].setMod('disabled', true));
			}

			for (let i = 0; i < submits.length; i++) {
				submitTasks.push(submits[i].setMod('progress', true));
			}

			await Promise.all([...elTasks, ...submitTasks]);
		}

		let elsToSubmit = await this.validate({focusOnError: true});
		elsToSubmit = Object.isArray(elsToSubmit) ? elsToSubmit : [];

		const
			submitCtx = {elements: elsToSubmit, form: <any>this};

		let
			formErr,
			res;

		if (elsToSubmit.length > 0) {
			let
				body = {},
				isMultipart = false;

			const
				tasks = <Array<Promise<unknown>>>[];

			for (let i = 0; i < elsToSubmit.length; i++) {
				const
					el = elsToSubmit[i],
					{name} = el;

				if (name == null || name === '' || body.hasOwnProperty(name)) {
					continue;
				}

				body[name] = true;
				tasks.push((async () => {
					let
						v = await el.groupFormValue;

					if (el.formConverter) {
						v = Array.concat([], el.formConverter).reduce((res, fn) => fn.call(this, res), v);
					}

					if (v instanceof Blob || v instanceof File || v instanceof FileList) {
						isMultipart = true;
					}

					body[name] = v;
				})());
			}

			await Promise.all(
				tasks
			);

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
					res = await this.action(body, submitCtx);

				} else {
					let
						that = this;

					if (this.action != null) {
						that = this.base(this.action);
					}

					res = await (<Function>that[this.method])(body, this.params);
				}

				Object.assign(this.tmp, body);

			} catch (err) {
				formErr = err;
			}
		}

		const
			delay = 0.2.second();

		if (elsToSubmit.length > 0 && Date.now() - start < delay) {
			await this.async.sleep(delay);
		}

		{
			const
				elTasks = <Array<CanPromise<boolean>>>[],
				submitTasks = <Array<CanPromise<boolean>>>[];

			for (let i = 0; i < els.length; i++) {
				elTasks.push(els[i].setMod('disabled', false));
			}

			for (let i = 0; i < submits.length; i++) {
				submitTasks.push(submits[i].setMod('progress', false));
			}

			await Promise.all([...elTasks, ...submitTasks]);
		}

		if (elsToSubmit.length === 0) {
			return;
		}

		if (formErr != null) {
			this.emitError('submitFail', formErr, submitCtx);
			throw formErr;
		}

		this.emit('submitSuccess', res, submitCtx);
	}

	/**
	 * Returns values of child form elements grouped by names
	 * @param [validation] - if you need only valid value
	 */
	async values(validation?: ValidateOptions): Promise<Dictionary<CanArray<FormValue>>> {
		const
			els = validation ? await this.validate(validation) : await this.elements;

		if (els !== false && els.length > 0) {
			const
				result = {},
				tasks = <Array<Promise<unknown>>>[];

			for (let i = 0; i < els.length; i++) {
				const
					el = els[i],
					{name} = el;

				if (name == null || name === '' || result.hasOwnProperty(name)) {
					continue;
				}

				tasks.push((async () => {
					let
						v = await el.groupFormValue;

					if (el.formConverter) {
						v = Array.concat([], el.formConverter).reduce((res, fn) => fn.call(this, res), v);
					}

					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					if (v !== undefined) {
						result[name] = v;
					}
				})());
			}

			await Promise.all(
				tasks
			);

			return result;
		}

		return {};
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
