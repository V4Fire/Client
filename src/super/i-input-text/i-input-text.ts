/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-input-text/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';

import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';

import iInput, {

	component,
	prop,

	ModsDecl

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

/**
 * Superclass to create text inputs
 */
@component({
	functional: {
		dataProvider: undefined
	}
})

export default class iInputText extends iInput implements iWidth, iSize {
	/**
	 * UI type of the input
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input
	 */
	@prop(String)
	readonly type: string = 'text';

	/**
	 * Autocomplete mode of the input
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefautocomplete
	 */
	@prop(String)
	readonly autocomplete: string = 'off';

	/**
	 * Placeholder text of the input
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefplaceholder
	 */
	@prop({type: String, required: false})
	readonly placeholder?: string;

	/**
	 * Readonly flag
	 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/readonly
	 */
	@prop({type: Boolean, required: false})
	readonly readonly?: boolean;

	/**
	 * Maximum text value length of the input
	 * https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Input#htmlattrdefmaxlength
	 */
	@prop({type: Number, required: false})
	readonly maxlength?: number;

	/**
	 * Value of the input's mask.
	 *
	 * The mask is used when you need to "decorate" some input value,
	 * like a phone number or credit card number. The mask can contain terminal and non-terminal symbols.
	 * The terminal symbols will be shown as they are written.
	 * The non-terminal symbols should start with `%` and one more symbol. For instance, `%d` means that it can be
	 * replaced by a numeric character (0-9).
	 *
	 * Supported non-terminal symbols:
	 *
	 * `%d` - is equivalent RegExp' `\d`
	 * `%w` - is equivalent RegExp' `\w`
	 * `%s` - is equivalent RegExp' `\s`
	 *
	 * @example
	 * ```
	 * < b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d'
	 * ```
	 */
	@prop({type: String, required: false})
	readonly mask?: string;

	/**
	 * Value of the mask placeholder.
	 * All non-terminal symbols from the mask without the specified value will have this placeholder.
	 *
	 * @example
	 * ```
	 * /// A user will see an input element with a value:
	 * /// +_ (___) ___-__-__
	 * /// When it starts typing, the value will automatically change, like,
	 * /// +7 (49_) ___-__-__
	 * < b-input :mask = '+%d% (%d%d%d) %d%d%d-%d%d-%d%d' | :maskPlaceholder = '_'
	 * ```
	 */
	@prop({type: String, watch: {handler: 'updateMask', immediate: true, provideArgs: false}})
	readonly maskPlaceholder: string = '_';

	/**
	 * A number of mask repetitions.
	 * This parameter allows you to specify how many times the mask pattern needs to apply to the input value.
	 * The `true` value means that the pattern can be repeated infinitely.
	 *
	 * @example
	 * ```
	 * /// A user will see an input element with a value:
	 * /// _-_
	 * /// If he types more than two symbols, he will see something like
	 * /// 2-3 1-_
	 * < b-input :mask = '%d-%d' | :maskRepeat = 2
	 * ```
	 */
	@prop({type: [Number, Boolean], required: false})
	readonly maskRepeatProp?: number | boolean;

	/**
	 * Delimiter for a mask value. This parameter is used when you are using the `maskRepeat` prop.
	 * Every next chunk of the mask will have the delimiter as a prefix.
	 *
	 * @example
	 * ```
	 * /// A user will see an input element with a value:
	 * /// _-_
	 * /// If he types more than two symbols, he will see something like
	 * /// 2-3@1-_
	 * < b-input :mask = '%d-%d' | :maskRepeat = 2 | :maskDelimiter = '@'
	 * ```
	 */
	@prop(String)
	readonly maskDelimiter: string = ' ';

	/**
	 * Dictionary with RegExp-s as values.
	 * Keys of the dictionary are interpreted as non-terminal symbols for the component mask, i.e.,
	 * you can add new non-terminal symbols.
	 *
	 * @example
	 * ```
	 * < b-input :mask = '%l%l%l' | :regExps = {l: /[a-z]/i}
	 * ```
	 */
	@prop({type: Object, required: false})
	readonly regExps?: Dictionary<RegExp>;

	/**
	 * True, if the mask is repeated infinitely
	 */
	get isMaskInfinite(): boolean {
		return this.maskRepeatProp === true;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iWidth.mods,
		...iSize.mods,

		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/** @override */
	protected normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		attrs.type = this.type;
		attrs.autocomplete = this.autocomplete;
		attrs.placeholder = this.placeholder;
		attrs.readonly = this.readonly;
		attrs.maxlength = this.maxlength;
		return attrs;
	}
}
