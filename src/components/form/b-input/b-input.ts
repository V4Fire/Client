/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-input/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import SyncPromise from 'core/promise/sync';

import iInputText, {

	component,
	prop,
	system,

	watch,
	hook,
	wait,

	TextValidators,
	ValidatorsDecl

} from 'components/super/i-input-text/i-input-text';

import Validators from 'components/form/b-input/validators';
import type { Value, FormValue } from 'components/form/b-input/interface';

export * from 'components/super/i-input/i-input';
export * from 'components/form/b-input/interface';

export * from 'components/form/b-input/validators';
export { default as InputValidators } from 'components/form/b-input/validators';

export { Value, FormValue };

const $$ = symbolGenerator();

@component({
	functional: {
		wait: undefined,
		dataProvider: undefined
	}
})

export default class bInput extends iInputText {
	/** @inheritDoc */
	declare readonly Value: Value;

	/** @inheritDoc */
	declare readonly FormValue: FormValue;

	@prop({type: String, required: false})
	override readonly valueProp?: this['Value'];

	@prop({type: String, required: false})
	override readonly defaultProp?: this['Value'];

	/**
	 * An additional text hint that is shown after non-empty input text.
	 * Mind, the hint value does not affect a component value.
	 */
	@prop({type: String, required: false})
	readonly textHint?: string;

	/**
	 * The minimum input value (for number and date types)
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmin
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly min?: number | string | Date;

	/**
	 * The maximum input value (for number and date types)
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmax
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly max?: number | string | Date;

	/**
	 * An icon to show before the input
	 *
	 * @example
	 * ```
	 * < b-input :preIcon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * The name of the used component to display `preIcon`
	 *
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
	 * The tooltip position to show when hovering over the `preIcon`
	 *
	 * @see gHint
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
	 * An icon to show after the input
	 *
	 * @example
	 * ```
	 * < b-input :icon = 'dropdown'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * The name of the used component to display `icon`
	 *
	 * @example
	 * ```
	 * < b-input :iconComponent = 'b-my-icon'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * The tooltip position to show when hovering over the `icon`
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
	 * @see gHint
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
	 * {@link bInput.textHint}
	 */
	get hasTextHint(): boolean {
		return Object.isString(this.textHint) && this.textHint !== '';
	}

	static override validators: ValidatorsDecl = {
		...iInputText.validators,
		...TextValidators,
		...Validators
	};

	/** @inheritDoc */
	declare protected readonly $refs: iInputText['$refs'] & {
		textHint?: HTMLSpanElement;
	};

	@system()
	protected override valueStore!: this['Value'];

	/**
	 * Returns the combined value from `text` and `textHint`.
	 *
	 * The tooltip is displayed after the entered text. Technically, it is placed below the native input and duplicates
	 * the entered value with the addition of a hint message. If `value` is set to "value" and `textHint` is set to
	 * "Some hint", the getter will return "valueSome hint".
	 */
	protected get textHintWithIndent(): string {
		return `${this.text}${this.textHint}`;
	}

	@system<bInput>({
		after: 'valueStore',
		init: (o) => o.sync.link((text) => {
			o.watch('valueProp', {label: $$.textStore}, () => {
				const label = {
					label: $$.textStoreToValueStore
				};

				o.watch('valueStore', label, (v: CanUndef<string>) => {
					o.async.clearAll(label);
					return link(v);
				});
			});

			return link(Object.cast(o.valueProp));

			function link(textFromValue: CanUndef<string>): string {
				const
					resolvedText = textFromValue ?? text ?? o.field.get('valueStore'),
					str = resolvedText !== undefined ? String(resolvedText) : '';

				if (o.isFunctional) {
					void o.waitComponentStatus('ready', {label: $$.textStoreSync}).then(() => o.text = str);

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
		const {value} = this;
		void this.clearText();

		if (value !== '') {
			this.async.clearAll({group: 'validation'});
			void this.removeMod('valid');
			this.emit('clear', this.value);
			return SyncPromise.resolve(true);
		}

		return SyncPromise.resolve(false);
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
	 * Synchronizes the typed text with the text hint, if one is provided
	 */
	protected syncTextHintValue(): void {
		if (!this.hasTextHint) {
			return;
		}

		const
			{textHint, input} = this.$refs;

		if (textHint == null) {
			return;
		}

		textHint.innerText = input.scrollWidth > input.clientWidth ? '' : this.textHintWithIndent;
	}

	protected override initValueListeners(): void {
		super.initValueListeners();

		this.localEmitter.on('maskedText.change', () => {
			this.emit('actionChange', this.value);
		});
	}

	/**
	 * Handler: the component text value has updated
	 */
	@watch({
		path: 'textStore',
		immediate: true,
		flush: 'sync'
	})

	@hook('beforeDataCreate')
	protected onTextUpdate(): void {
		this.field.set('valueStore', this.text);
		this.syncTextHintValue();
	}

	/**
	 * Handler: manual editing of the component text value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected onEdit(): void {
		if (this.maskAPI.compiledMask != null) {
			return;
		}

		this.value = this.$refs.input.value;
		this.field.set('textStore', this.value);
		this.emit('actionChange', this.value);
	}

	/**
	 * Handler: clearing the component value
	 * @emits `actionChange(value: this['Value'])`
	 */
	protected async onClear(): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this.value);
		}
	}
}
