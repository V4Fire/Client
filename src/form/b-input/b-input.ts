/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:form/b-input/README.md]]
 * @packageDocumentation
 */

//#if demo
import 'models/demo/input';
//#endif

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import { deprecated } from 'core/functools/deprecation';

import iInputText, {

	component,
	prop,
	system,

	watch,
	hook,
	wait,

	TextValidators,
	ValidatorsDecl

} from 'super/i-input-text/i-input-text';

import Validators from 'form/b-input/modules/validators';
import type { Value, FormValue } from 'form/b-input/interface';

export * from 'super/i-input/i-input';
export * from 'form/b-input/interface';

export * from 'form/b-input/modules/validators';
export { default as InputValidators } from 'form/b-input/modules/validators';

export { Value, FormValue };

export const
	$$ = symbolGenerator();

/**
 * Component to create a form input
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInput extends iInputText {
	override readonly Value!: Value;
	override readonly FormValue!: FormValue;
	override readonly rootTag: string = 'span';

	@prop({type: String, required: false})
	override readonly valueProp?: this['Value'];

	@prop({type: String, required: false})
	override readonly defaultProp?: this['Value'];

	/**
	 * An additional text hint that is shown after the non-empty input text.
	 * Mind, the hint value does not affect a component value.
	 */
	@prop({type: String, required: false})
	readonly textHint?: string;

	/**
	 * The minimum value of the input (for number and date types)
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmin
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly min?: number | string | Date;

	/**
	 * The maximum value of the input (for number and date types)
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmax
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly max?: number | string | Date;

	/**
	 * Icon to show before the input
	 *
	 * @example
	 * ```
	 * < b-input :preIcon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Name of the used component to show `preIcon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-input :preIconComponent = 'b-my-icon'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `preIcon`
	 *
	 * @example
	 * ```
	 * < b-input :preIcon = 'dropdown' | :preIconHint = 'Show variants'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `preIcon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-input &
	 *   :preIcon = 'dropdown' |
	 *   :preIconHint = 'Show variants' |
	 *   :preIconHintPos = 'bottom-right'
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon to show after the input
	 *
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Name of the used component to show `icon`
	 *
	 * @default `'b-icon'`
	 * @example
	 * ```
	 * < b-input :iconComponent = 'b-my-icon'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text to show during hover the cursor on `icon`
	 *
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown' | :iconHint = 'Show variants'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position to show during hover the cursor on `icon`
	 *
	 * @see [[gHint]]
	 * @example
	 * ```
	 * < b-input &
	 *   :icon = 'dropdown' |
	 *   :iconHint = 'Show variants' |
	 *   :iconHintPos = 'bottom-right'
	 * .
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * A component to show "in-progress" state or
	 * Boolean, if needed to show progress by slot or `b-progress-icon`
	 *
	 * @default `'b-progress-icon'`
	 * @example
	 * ```
	 * < b-input :progressIcon = 'b-my-progress-icon'
	 * ```
	 */
	@prop({type: [String, Boolean], required: false})
	readonly progressIcon?: string | boolean;

	override get value(): this['Value'] {
		return this.field.get<this['Value']>('valueStore')!;
	}

	override set value(value: this['Value']) {
		this.text = value;
		this.field.set('valueStore', this.text);
	}

	override get default(): this['Value'] {
		return this.defaultProp != null ? String(this.defaultProp) : '';
	}

	/**
	 * True, if the component has a text hint
	 * @see [[bInput.textHint]]
	 */
	get hasTextHint(): boolean {
		return Object.isString(this.textHint) && this.textHint !== '';
	}

	static override validators: ValidatorsDecl = {
		...iInputText.validators,
		...TextValidators,
		...Validators
	};

	protected override readonly $refs!: iInputText['$refs'] & {
		textHint?: HTMLSpanElement;
	};

	@system()
	protected override valueStore!: this['Value'];

	/**
	 * Returns a value from `text` and `textHint` joined together with a space.
	 *
	 * A hint is shown after the input text. Technically, it’s placed under the native input and duplicates the entered
	 * value with adding a hint message. If `value` is set to "value" and `textHint` is set to "Some hint",
	 * the getter will return "valueSome hint".
	 */
	protected get textHintWithIndent(): string {
		return `${this.text}${this.textHint}`;
	}

	@system({
		after: 'valueStore',
		init: (o) => o.sync.link((text) => {
			o.watch('valueProp', {label: $$.textStore}, () => {
				const label = {
					label: $$.textStoreToValueStore
				};

				o.watch('valueStore', label, (v) => {
					o.async.clearAll(label);
					return link(v);
				});
			});

			return link(Object.cast(o.valueProp));

			function link(textFromValue: CanUndef<string>): string {
				const
					resolvedText = textFromValue === undefined ? text ?? o.field.get('valueStore') : textFromValue,
					str = resolvedText !== undefined ? String(resolvedText) : '';

				if (o.isNotRegular) {
					void o.waitStatus('ready', {label: $$.textStoreSync}).then(() => o.text = str);

				} else if (o.hook === 'updated') {
					o.text = str;
				}

				return str;
			}
		})
	})

	protected override textStore!: string;

	@wait('ready', {label: $$.clear})
	override clear(): Promise<boolean> {
		const v = this.value;
		void this.clearText();

		if (v !== '') {
			this.async.clearAll({group: 'validation'});
			void this.removeMod('valid');
			this.emit('clear', this.value);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
	}

	/**
	 * @deprecated
	 * @see [[bInput.selectText]]
	 */
	@deprecated({renamedTo: 'selectText'})
	selectAll(): Promise<boolean> {
		return SyncPromise.resolve(this.selectText());
	}

	protected override normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		attrs = {
			...super.normalizeAttrs(attrs),
			min: this.min,
			max: this.max
		};

		return attrs;
	}

	/**
	 * Synchronizes the typed text with a text hint, if it specified.
	 * Returns true if synchronization has been successful.
	 */
	protected syncTextHintValue(): boolean {
		if (!this.hasTextHint) {
			return false;
		}

		const
			{textHint, input} = this.$refs;

		if (textHint == null) {
			return false;
		}

		textHint.innerText = input.scrollWidth > input.clientWidth ?
			'' :
			this.textHintWithIndent;

		return true;
	}

	/**
	 * Handler: updating of a component text value
	 */
	@watch({path: 'textStore', immediate: true})
	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.field.set('valueStore', this.text);
		this.syncTextHintValue();
	}

	/**
	 * Handler: manual editing of a component text value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onEdit(): void {
		if (this.compiledMask != null) {
			return;
		}

		this.value = this.$refs.input.value;
		this.field.set('textStore', this.value);
		this.emit('actionChange', this.value);
	}

	/**
	 * Handler: clearing of a component value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected async onClear(): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
		}
	}

	protected override onMaskInput(): Promise<boolean> {
		return super.onMaskInput().then((res) => {
			if (res) {
				this.emit('actionChange', this.value);
			}

			return res;
		});
	}

	protected override onMaskKeyPress(e: KeyboardEvent): boolean {
		if (super.onMaskKeyPress(e)) {
			this.emit('actionChange', this.value);
			return true;
		}

		return false;
	}

	protected override onMaskDelete(e: KeyboardEvent): boolean {
		if (super.onMaskDelete(e)) {
			this.emit('actionChange', this.value);
			return true;
		}

		return false;
	}
}
