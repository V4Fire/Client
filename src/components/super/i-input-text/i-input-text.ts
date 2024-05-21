/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-input-text/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import iWidth from 'components/traits/i-width/i-width';
import iSize from 'components/traits/i-size/i-size';

import iInput, {

	component,
	prop,
	system,
	computed,
	wait,

	ModsDecl,
	UnsafeGetter

} from 'components/super/i-input/i-input';

import Mask from 'components/super/i-input-text/mask';
import type { UnsafeIInputText } from 'components/super/i-input-text/interface';

//#if runtime has dummyComponents
import('components/super/i-input-text/test/b-super-i-input-text-dummy');
//#endif

export * from 'components/super/i-input/i-input';
export * from 'components/super/i-input-text/interface';

export * from 'components/super/i-input-text/validators';
export { default as TextValidators } from 'components/super/i-input-text/validators';

const
	$$ = symbolGenerator();

@component()
export default class iInputText extends iInput implements iWidth, iSize {
	/**
	 * The input text value
	 */
	@prop({type: String, required: false})
	readonly textProp?: string;

	/**
	 * The input UI type
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#input_types
	 */
	@prop(String)
	readonly type: string = 'text';

	/**
	 * The input autocomplete mode
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefautocomplete
	 */
	@prop(String)
	readonly autocomplete: string = 'off';

	/**
	 * The input placeholder
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefplaceholder
	 */
	@prop({type: String, required: false})
	readonly placeholder?: string;

	/**
	 * The minimum length of the input text value.
	 * The option will be ignored if the `mask` is specified.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefminlength
	 */
	@prop({type: Number, required: false})
	readonly minLength?: number;

	/**
	 * The maximum length of the input text value.
	 * The option will be ignored if the `mask` is specified.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmaxlength
	 */
	@prop({type: Number, required: false})
	readonly maxLength?: number;

	/**
	 * The input text value mask.
	 *
	 * The mask is used when you need to "decorate" some input value, such as a phone number or a credit card number.
	 * The mask may contain terminal and non-terminal symbols. The terminal symbols will be displayed as they are written.
	 * The non-terminal symbols must start with `%` and one more character. For instance, `%d` means that it can be
	 * replaced by a numeric character (0-9).
	 *
	 * Supported non-terminal symbols:
	 *
	 * `%d` - is equivalent RegExp `\d`
	 * `%w` - is equivalent RegExp `\w`
	 * `%s` - is equivalent RegExp `\s`
	 *
	 * @example
	 * ```
	 * < b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d'
	 * ```
	 */
	@prop({
		type: String,
		required: false,
		watch: {
			handler: 'initMask',
			immediate: true,
			provideArgs: false
		}
	})

	readonly mask?: string;

	/**
	 * The mask placeholder value.
	 * All non-terminal symbols from the mask without a specified value will have this placeholder.
	 *
	 * @example
	 * ```
	 * /// The user will see an input element with the value:
	 * /// +_ (___) ___-__-__
	 * /// When it starts typing, the value will be automatically changed, for example,
	 * /// +7 (49_) ___-__-__
	 * < b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d' | :maskPlaceholder = '_'
	 * ```
	 */
	@prop({
		type: String,
		validator: (v: string) => [...v.letters()].length === 1
	})

	readonly maskPlaceholder: string = '_';

	/**
	 * The number of repetitions of the mask.
	 * This option allows you to specify how many times the mask pattern should be applied to the input value.
	 * The `true` value means that the pattern can  repeat indefinitely.
	 *
	 * @example
	 * ```
	 * /// The user will see an input element with the value:
	 * /// _-_
	 * /// When it starts typing, the value will be automatically changed, for example,
	 * /// 2-3 1-_
	 * < b-input :mask = '%d-%d' | :maskRepetitions = 2
	 * ```
	 */
	@prop({type: [Number, Boolean], required: false})
	readonly maskRepetitionsProp?: number | boolean;

	/**
	 * The delimiter for the mask value. This parameter is used when you use the `maskRepetitions` property.
	 * Each subsequent mask fragment will have this delimiter as a prefix.
	 *
	 * @example
	 * ```
	 * /// The user will see an input element with the value:
	 * /// _-_
	 * /// When it starts typing, the value will be automatically changed, for example,
	 * /// 2-3@1-_
	 * < b-input :mask = '%d-%d' | :maskRepetitions = 2 | :maskDelimiter = '@'
	 * ```
	 */
	@prop(String)
	readonly maskDelimiter: string = ' ';

	/**
	 * A dictionary with RegExp-s as values.
	 * The dictionary keys are interpreted as non-terminal symbols for the component mask, i.e.
	 * you can add new non-terminal symbols.
	 *
	 * @example
	 * ```
	 * < b-input :mask = '%l%l%l' | :regExps = {l: /[a-z]/i}
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly regExps?: Dictionary<RegExp>;

	override get unsafe(): UnsafeGetter<UnsafeIInputText<this>> {
		return Object.cast(this);
	}

	/**
	 * The input text value
	 * {@link iInputText.textStore}
	 */
	@computed({cache: false})
	get text(): string {
		const
			v = this.field.get<string>('textStore') ?? '';

		// If the input is empty, don't return the empty mask
		if (this.maskAPI.compiledMask?.placeholder === v) {
			return '';
		}

		return v;
	}

	/**
	 * Sets a new input text value
	 * @param value
	 */
	set text(value: string) {
		if (this.mask != null) {
			void this.maskAPI.syncWithText(value);
			return;
		}

		this.updateTextStore(value);
	}

	/**
	 * True if the mask repeats indefinitely
	 */
	get isMaskInfinite(): boolean {
		return this.maskRepetitionsProp === true;
	}

	static override readonly mods: ModsDecl = {
		...iWidth.mods,
		...iSize.mods,

		empty: [
			'true',
			'false'
		],

		readonly: [
			'true',
			['false']
		]
	};

	/**
	 * The input text value
	 * {@link iInputText.textProp}
	 */
	@system((o) => o.sync.link((v) => v ?? ''))
	protected textStore!: string;

	/**
	 * API for managing the input mask
	 */
	@system((o) => new Mask(o))
	protected maskAPI!: Mask;

	protected override readonly $refs!: iInput['$refs'] & {
		input: HTMLInputElement;
	};

	/**
	 * Selects the entire content of the input
	 * @emits `selectText()`
	 */
	@wait('ready', {label: $$.selectText})
	selectText(): CanPromise<boolean> {
		const
			{input} = this.$refs;

		if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length) {
			input.select();
			this.emit('selectText');
			return true;
		}

		return false;
	}

	/**
	 * Clears the content of the input
	 * @emits `clearText()`
	 */
	@wait('ready', {label: $$.clearText})
	clearText(): CanPromise<boolean> {
		if (this.text === '') {
			return false;
		}

		if (this.mask != null) {
			void this.maskAPI.syncWithText('');

		} else {
			this.text = '';
		}

		this.emit('clearText');
		return true;
	}

	/**
	 * Initializes the component mask
	 */
	@wait('ready', {label: $$.initMask})
	protected initMask(): CanPromise<void> {
		if (this.mask == null) {
			return;
		}

		this.maskAPI.init();
	}

	/**
	 * Updates the component text store with the provided value
	 * @param value
	 */
	protected updateTextStore(value: string): void {
		const
			{input} = this.$refs;

		// Force to set a value to the input
		if (Object.isTruly(input)) {
			input.value = value;
		}

		this.field.set('textStore', value);
	}

	protected override normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		attrs = {
			...attrs,
			type: this.type,

			placeholder: this.placeholder,
			autocomplete: this.autocomplete,
			readonly: Object.parse(this.mods.readonly),

			minlength: this.minLength,
			maxlength: this.maxLength
		};

		return attrs;
	}

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('empty', 'text', (v) => v === '');
	}

	protected mounted(): void {
		this.updateTextStore(this.text);
	}
}
