/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

//#if runtime has core/data
import 'core/data';
//#endif

import iVisible from 'traits/i-visible/i-visible';
import iInput from 'super/i-input/i-input';

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

import { ActionFn, ValidateParams } from 'form/b-form/modules/interface';

export * from 'super/i-data/i-data';
export * from 'form/b-form/modules/interface';

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bForm extends iData {
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
	 * Form action URL or an action function
	 */
	@prop({type: [String, Function], required: false})
	readonly action?: string | ActionFn;

	/**
	 * Data provider method
	 */
	@prop(String)
	readonly method: ModelMethod = 'add';

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
	 * Form request parameters store
	 */
	// tslint:disable-next-line:prefer-object-spread
	@field<bForm>((o) => o.sync.link((val) => Object.assign(o.params || {}, val)))
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
	 * Array of form components
	 */
	get elements(): CanPromise<ReadonlyArray<iInput>> {
		const
			cache = Object.createDict();

		return this.waitStatus('ready', () => {
			const
				els = <iInput[]>[];

			for (let o = Array.from(this.$refs.form.elements), i = 0; i < o.length; i++) {
				const
					component = this.dom.getComponent<iInput>(o[i], '[class*="_form_true"]');

				if (component && component.instance instanceof iInput && !cache[component.componentId]) {
					cache[component.componentId] = true;
					els.push(component);
				}
			}

			return Object.freeze(els);
		});
	}

	/**
	 * Array of form submit components
	 */
	get submits(): CanPromise<ReadonlyArray<bButton>> {
		return this.waitStatus('ready', () => {
			const list = Array.from(this.$el.querySelectorAll('button[type="submit"]')).concat(
				this.id ? Array.from(document.body.querySelectorAll(`button[type="submit"][form="${this.id}"]`)) : []
			);

			const
				els = <bButton[]>[];

			for (let i = 0; i < list.length; i++) {
				els.push(<bButton>this.dom.getComponent(list[i]));
			}

			return Object.freeze(els);
		});
	}

	/**
	 * Clears child form components
	 * @emits clear()
	 */
	async clear(): Promise<boolean> {
		const
			tasks = <Promise<boolean>[]>[];

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
	 * Resets child form components to default
	 * @emits reset()
	 */
	async reset(): Promise<boolean> {
		const
			tasks = <Promise<boolean>[]>[];

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
	 * Validates child form components and returns their or false
	 *
	 * @param [params] - additional validation parameters
	 *
	 * @emits validationStart()
	 * @emits validationSuccess()
	 * @emits validationFail(failedValidation: ValidationError)
	 * @emits validationEnd(result: boolean, failedValidation: CanUndef<ValidationError>)
	 */
	@wait('ready', {defer: true, label: $$.validate})
	async validate(params: ValidateParams = {}): Promise<iInput[] | false> {
		this.emit('validationStart');

		const
			els = <iInput[]>[],
			values = Object.createDict();

		let
			valid = true,
			failedValidation;

		for (let o = await this.elements, i = 0; i < o.length; i++) {
			const
				el = o[i],
				{name} = el;

			if (!name) {
				continue;
			}

			if (!this.cache || !el.cache || !Object.fastCompare(
				this.field.get(`tmp.${name}`),
				values[name] || (values[name] = await el.groupFormValue)
			)) {
				const
					canValidate = el.mods.valid !== 'true',
					validation = canValidate && await el.validate();

				if (canValidate && validation !== true) {
					if (params.focusOnError) {
						try {
							await el.focus();
						} catch {}
					}

					failedValidation = {el, validator: validation};
					valid = false;
					break;
				}

				if (name !== '_') {
					els.push(el);
				}
			}
		}

		if (valid) {
			this.emit('validationSuccess');

		} else {
			this.emitError('validationFail', failedValidation);
		}

		this.emit('validationEnd', valid, failedValidation);
		return valid && els;
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
				elTasks = <CanPromise<boolean>[]>[],
				submitTasks = <CanPromise<boolean>[]>[];

			for (let i = 0; i < els.length; i++) {
				elTasks.push(els[i].setMod('disabled', true));
			}

			for (let i = 0; i < submits.length; i++) {
				submitTasks.push(submits[i].setMod('progress', true));
			}

			await Promise.all([...elTasks, ...submitTasks]);
		}

		const
			elsToSubmit = await this.validate({focusOnError: true}),
			submitCtx = {elements: elsToSubmit || [], form: <any>this};

		let
			formErr,
			res;

		if (elsToSubmit && elsToSubmit.length) {
			let
				body = {},
				isMultipart = false;

			const
				tasks = <Promise<unknown>[]>[];

			for (let i = 0; i < elsToSubmit.length; i++) {
				const
					el = elsToSubmit[i],
					{name} = el;

				if (!name || body.hasOwnProperty(name)) {
					continue;
				}

				body[name] = true;
				tasks.push((async () => {
					let
						v = await el.groupFormValue;

					if (el.formConverter) {
						v = (<Function[]>[]).concat(el.formConverter).reduce((res, fn) => fn.call(this, res), v);
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
					if (this.action) {
						this.base(this.action);
					}

					res = await (<Function>this[this.method])(body, this.params);
				}

				Object.assign(this.tmp, body);

			} catch (err) {
				formErr = err;
			}
		}

		const
			delay = 0.2.second();

		if (elsToSubmit && Date.now() - start < delay) {
			await this.async.sleep(delay);
		}

		{
			const
				elTasks = <CanPromise<boolean>[]>[],
				submitTasks = <CanPromise<boolean>[]>[];

			for (let i = 0; i < els.length; i++) {
				elTasks.push(els[i].setMod('disabled', false));
			}

			for (let i = 0; i < submits.length; i++) {
				submitTasks.push(submits[i].setMod('progress', false));
			}

			await Promise.all([...elTasks, ...submitTasks]);
		}

		if (!elsToSubmit) {
			return;
		}

		if (formErr) {
			this.emitError('submitFail', formErr, submitCtx);
			throw formErr;
		}

		this.emit('submitSuccess', res, submitCtx);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}
}
