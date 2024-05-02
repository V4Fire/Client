/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-input/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import State, { set } from 'components/friends/state';
import Block, { element } from 'components/friends/block';
import DOM, { getComponent } from 'components/friends/dom';

import iAccess from 'components/traits/i-access/i-access';
import iVisible from 'components/traits/i-visible/i-visible';

import {

	component,
	system,

	hook,
	wait,

	ModsDecl,
	UnsafeGetter

} from 'components/super/i-data/i-data';

import iInputHandlers from 'components/super/i-input/modules/handlers';

import type {

	UnsafeIInput,

	ValidatorMessage,
	ValidatorResult,

	ValidatorParams,

	ValidationError,
	ValidationResult

} from 'components/super/i-input/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/super/i-input/modules/helpers';
export * from 'components/super/i-input/interface';

State.addToPrototype({set});
Block.addToPrototype({element});
DOM.addToPrototype({getComponent});

const
	$$ = symbolGenerator();

@component()
export default abstract class iInput extends iInputHandlers implements iVisible, iAccess {
	static override readonly mods: ModsDecl = {
		...iAccess.mods,
		...iVisible.mods,

		form: [
			['true'],
			'false'
		],

		valid: [
			'true',
			'false'
		],

		showInfo: [
			'true',
			'false'
		],

		showError: [
			'true',
			'false'
		]
	};

	override get unsafe(): UnsafeGetter<UnsafeIInput<this>> {
		return Object.cast(this);
	}

	/**
	 * Internal validation error message
	 */
	@system()
	private validationMessage?: string;

	/** {@link iAccess.prototype.enable} */
	enable(): Promise<boolean> {
		return iAccess.enable(this);
	}

	/** {@link iAccess.prototype.disable} */
	disable(): Promise<boolean> {
		return iAccess.disable(this);
	}

	/** {@link iAccess.prototype.focus} */
	@wait('ready', {label: $$.focus})
	focus(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && !this.isFocused) {
			input.focus();
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/** {@link iAccess.prototype.blur} */
	@wait('ready', {label: $$.blur})
	blur(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input != null && this.isFocused) {
			input.blur();
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Clears the component value to undefined
	 * @emits `clear(value: this['Value'])`
	 */
	@wait('ready', {label: $$.clear})
	clear(): Promise<boolean> {
		if (this.value !== undefined) {
			this.value = undefined;
			this.async.clearAll({group: 'validation'});

			const emit = () => {
				void this.removeMod('valid');
				this.emit('clear', this.value);
				return true;
			};

			if (this.meta.systemFields.value != null) {
				return SyncPromise.resolve(emit());
			}

			return this.nextTick().then(emit);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Resets the component value to its default value
	 * @emits `reset(value: this['Value'])`
	 */
	@wait('ready', {label: $$.reset})
	async reset(): Promise<boolean> {
		if (this.value !== this.default) {
			this.value = this.default;
			this.async.clearAll({group: 'validation'});

			const emit = () => {
				void this.removeMod('valid');
				this.emit('reset', this.value);
				return true;
			};

			if (this.meta.systemFields.value != null) {
				return SyncPromise.resolve(emit());
			}

			return this.nextTick().then(emit);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * Returns a validator error message based on passed parameters
	 *
	 * @param err - the error details
	 * @param message - the validator message object
	 * @param defaultMessage - the default error message
	 */
	getValidatorMessage(err: ValidatorResult, message: ValidatorMessage, defaultMessage: string): string {
		if (Object.isFunction(message)) {
			const m = message(err);
			return Object.isTruly(m) ? m : defaultMessage;
		}

		if (Object.isPlainObject(message)) {
			return (Object.isPlainObject(err) && Boolean(message[err.name])) ?
				message[err.name]! :
				defaultMessage;
		}

		return Object.isTruly(message) ? String(message) : defaultMessage;
	}

	/**
	 * Sets a new validation error message to the component
	 *
	 * @param message
	 * @param [showMessage] - if true, then the message will be provided to .error
	 */
	setValidationMessage(message: string, showMessage: boolean = false): void {
		this.validationMessage = message;

		if (showMessage) {
			this.error = message;
		}
	}

	/**
	 * Validates the component value.
	 * The method returns true if the validation is successful or an object with error information.
	 *
	 * @param opts - additional options
	 *
	 * @emits `validationStart()`
	 * @emits `validationSuccess()`
	 * @emits `validationFail(failedValidation: ValidationError<this['FormValue']>)`
	 * @emits `validationEnd(success: boolean, failedValidation?: ValidationError<this['FormValue']>)`
	 */
	@wait('ready', {defer: true, label: $$.validate})
	async validate(opts?: ValidatorParams): Promise<ValidationResult<this['FormValue']>> {
		if (this.validators.length === 0) {
			void this.removeMod('valid');
			return true;
		}

		this.emit('validationStart');

		let
			valid: CanUndef<ValidationResult<this['FormValue']>>,
			failedValidation: CanUndef<ValidationError>;

		for (const decl of this.validators) {
			const
				isArray = Object.isArray(decl),
				isPlainObject = !isArray && Object.isPlainObject(decl);

			let
				validatorName: string;

			if (isPlainObject) {
				validatorName = Object.keys(decl)[0];

			} else if (isArray) {
				validatorName = decl[0];

			} else {
				validatorName = decl;
			}

			const
				validator = this.validatorsMap[validatorName];

			if (validator == null) {
				throw new Error(`The "${validatorName}" validator is not defined`);
			}

			const validation = validator.call(
				this,
				Object.assign((isPlainObject ? decl[validatorName] : (isArray && decl[1])) ?? {}, opts)
			);

			if (Object.isPromise(validation)) {
				void this.removeMod('valid');
				void this.setMod('progress', true);
			}

			try {
				valid = await validation;

			} catch (err) {
				valid = err;
			}

			if (valid !== true) {
				failedValidation = {
					validator: validatorName,
					message: this.validationMessage,

					error: {
						name: validatorName,
						...Object.isPlainObject(valid) ? valid : {}
					}
				};

				break;
			}
		}

		void this.setMod('progress', false);

		if (valid != null) {
			void this.setMod('valid', valid === true);

		} else {
			void this.removeMod('valid');
		}

		if (valid === true) {
			this.emit('validationSuccess');

		} else if (valid != null) {
			this.emit('validationFail', failedValidation);
		}

		this.validationMessage = undefined;
		this.emit('validationEnd', valid === true, failedValidation);

		return valid === true ? valid : failedValidation!;
	}

	/**
	 * Resolves the passed component value and returns it.
	 * If the value argument is undefined, the method can return the default value.
	 *
	 * @param [value]
	 */
	protected resolveValue(value?: this['Value']): this['Value'] {
		const
			i = this.instance;

		if (value === undefined && this.lfc.isBeforeCreate()) {
			return i['defaultGetter'].call(this);
		}

		return value;
	}

	/**
	 * Normalizes the passed attributes and returns it
	 * {@link iInput.attrs}
	 *
	 * @param [attrs]
	 */
	protected normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		return attrs;
	}

	/**
	 * Initializes default event listeners for the component value
	 */
	@hook('created')
	protected initValueListeners(): void {
		this.watch('value', this.onValueChange.bind(this));
		this.on('actionChange', () => this.validate());
	}

	protected override initBaseAPI(): void {
		super.initBaseAPI();
		this.resolveValue = this.instance.resolveValue.bind(this);
	}
}
