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
	system,
	computed,
	wait,

	ModsDecl,
	UnsafeGetter

} from 'super/i-input/i-input';

//#if runtime has iInputText/mask
import * as mask from 'super/i-input-text/modules/mask';
//#endif

import { CompiledMask, ApplyMaskToTextOptions, UnsafeIInputText } from 'super/i-input-text/interface';

export * from 'super/i-input/i-input';
export * from 'super/i-input-text/interface';

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
	 * Initial text value of the input
	 */
	@prop(String)
	readonly textProp: string = '';

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
	@prop({type: String, watch: {handler: 'initMask', immediate: true, provideArgs: false}})
	readonly maskPlaceholder: string = '_';

	/**
	 * A number of mask repetitions.
	 * This parameter allows you to specify how many times the mask pattern needs to apply to the input value.
	 * The `true` value means that the pattern can be repeated infinitely.
	 *
	 * @example
	 * ```
	 * /// A user will see an input element with a value:
	 * /// _-_ _-_
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
	 * /// _-_@_-_
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

	/** @override */
	get unsafe(): UnsafeGetter<UnsafeIInputText<this>> {
		return <any>this;
	}

	/**
	 * Text value of the input
	 * @see [[iInputText.text]]
	 */
	@computed({cache: false})
	get text(): string {
		const
			v = this.field.get<string>('textStore') ?? '';

		// If the input is empty, don't provide the mask
		if (this.compiledMask?.placeholder === v) {
			return '';
		}

		return v;
	}

	/**
	 * Sets a new text value of the input
	 * @param value
	 */
	set text(value: string) {
		this.field.set('textStore', value);

		const
			{input} = this.$refs;

		// Force to set a value to the input
		if (Object.isTruly(input)) {
			input.value = value;
		}
	}

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

	/**
	 * Text value store of the input
	 * @see [[iInputText.textProp]]
	 */
	@system((o) => o.sync.link())
	protected textStore!: string;

	/**
	 * Temporary value of the masked input
	 */
	@system()
	protected maskText: string = '';

	/**
	 * Object of the compiled mask
	 * @see [[iInputText.mask]]
	 */
	@system()
	protected compiledMask?: CompiledMask;

	/**
	 * A number of mask repetitions
	 * @see [[iInputText.maskRepeatProp]]
	 */
	@system((o) => o.sync.link((v) => v === true ? 42 : v ?? 1))
	protected maskRepeat!: number;

	/**
	 * Start index of the last selection via masked input
	 */
	@system()
	protected lastMaskSelectionStartIndex?: Nullable<number>;

	/**
	 * End index of the last selection via masked input
	 */
	@system()
	protected lastMaskSelectionEndIndex?: Nullable<number>;

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Selects all content of the input
	 * @emits `selectText()`
	 */
	@wait('ready', {label: $$.selectAll})
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
	 * Clears content of the input
	 * @emits `clearText()`
	 */
	@wait('ready', {label: $$.clearText})
	clearText(): CanPromise<boolean> {
		if (this.text === '') {
			return false;
		}

		if (this.mask != null) {
			void this.applyMaskToText('');

		} else {
			this.text = '';
		}

		this.emit('selectText');
		return true;
	}

	/**
	 * Applies the component mask to the specified text.
	 * The method can take additional options to specify the text selection and position of the text cursor.
	 *
	 * @param [text]
	 * @param [opts] - additional options
	 */
	@wait('ready', {label: $$.applyMaskToText})
	protected applyMaskToText(text: string = this.text, opts: ApplyMaskToTextOptions = {}): CanPromise<void> {
		let
			start = 0,
			end = 0;

		if (text !== '') {
			start = opts.start ?? 0;
			end = opts.end ?? 0;
		}

		const
			mask = this.compiledMask,
			maskSymbols = mask?.symbols;

		if (mask == null || maskSymbols == null) {
			return;
		}

		const
			isFocused = this.mods.focused === 'true';

		let
			withoutSelection = start === end;

		const
			{maskText = this.maskText} = opts;

		let
			maskedInput = '',
			pos = -1;

		if (text === '') {
			if (isFocused) {
				start = 0;
				end = 0;
				withoutSelection = true;
				maskedInput = mask.placeholder;
			}

		} else {
			const
				chunks = text.split('').slice(start, withoutSelection ? undefined : end);

			const resolveNonTerminalFromBuffer = (pattern: RegExp, i: number) => {
				const
					char = maskText[i];

				if (!pattern.test(char)) {
					return this.maskPlaceholder;
				}

				return char;
			};

			for (let i = 0; i < maskSymbols.length; i++) {
				const
					symbol = maskSymbols[i],
					isNonTerminal = Object.isRegExp(symbol);

				// Restoration of values that don't match the selection range
				if (i < start || !withoutSelection && i > end) {
					if (isNonTerminal) {
						maskedInput += resolveNonTerminalFromBuffer(<RegExp>symbol, i);

					} else {
						maskedInput += symbol;
					}

					continue;
				}

				if (isNonTerminal) {
					const
						nonTerminal = <RegExp>symbol;

					if (chunks.length > 0) {
						// Skip all symbols that don't match the non-terminal grammar
						while (chunks.length > 0 && !nonTerminal.test(chunks[0])) {
							chunks.shift();
						}

						if (chunks.length > 0) {
							maskedInput += chunks[0];
							pos++;
						}
					}

					// There are no symbols from the raw input that match the non-terminal grammar
					if (chunks.length === 0) {
						maskedInput += resolveNonTerminalFromBuffer(nonTerminal, i);

					} else {
						chunks.shift();
					}

				// This is a static symbol from the mask
				} else {
					maskedInput += symbol;
				}
			}
		}

		this.text = maskedInput;
		this.maskText = maskedInput;

		if (isFocused) {
			if (withoutSelection) {
				pos = start + pos + 1;

				while (pos < maskSymbols.length && !Object.isRegExp(maskSymbols[pos])) {
					pos++;
				}

			} else {
				pos = end;
			}

			this.lastMaskSelectionStartIndex = pos;
			this.lastMaskSelectionEndIndex = pos;

			this.$refs.input.setSelectionRange(pos, pos);
		}
	}

	/**
	 * Initializes the component mask
	 */
	@wait('ready', {label: $$.initMask})
	protected initMask(): CanPromise<void> {
		const {
			async: $a,
			$refs: {input}
		} = this;

		const group = {
			group: 'mask'
		};

		$a.off(group);

		if (this.mask == null) {
			this.compiledMask = undefined;
			return;
		}

		$a.on(input, 'mousedown keydown', this.onMaskNavigate.bind(this), group);
		$a.on(input, 'mousedown keydown', this.onMaskValueReady.bind(this), group);
		$a.on(input, 'mouseup keyup', this.onMaskValueReady.bind(this), {
			options: {
				capture: true
			},

			...group
		});

		$a.on(input, 'keypress', this.onMaskKeyPress.bind(this), group);
		$a.on(input, 'keydown', this.onMaskBackspace.bind(this), group);
		$a.on(input, 'input', this.onMaskInput.bind(this), group);
		$a.on(input, 'focus', this.onMaskFocus.bind(this), group);
		$a.on(input, 'blur', this.onMaskBlur.bind(this), group);

		this.compileMask();
		this.applyMaskToText();
	}

	/**
	 * Compiles the component mask.
	 * The method saves the compiled mask object and other properties within the component.
	 */
	protected compileMask(): void {
		if (this.mask == null) {
			return;
		}

		const
			symbols = <Array<string | RegExp>>[];

		let
			placeholder = '',
			isNonTerminal = false;

		for (let o = this.mask, i = 0, j = 0; i < o.length && j < this.maskRepeat; i++) {
			const
				el = o[i];

			if (el === '%') {
				isNonTerminal = true;
				continue;
			}

			placeholder += isNonTerminal ? this.maskPlaceholder : el;

			if (isNonTerminal) {
				symbols.push(this.regExps?.[el] ?? new RegExp(`\\${el}`));
				isNonTerminal = false;

			} else {
				symbols.push(el);
			}

			if (i === o.length - 1) {
				i = -1;
				j++;

				if (j < this.maskRepeat) {
					placeholder += this.maskDelimiter;
					symbols.push(this.maskDelimiter);
				}
			}
		}

		this.compiledMask = {
			symbols,
			placeholder
		};

		this.maskText = '';
		this.lastMaskSelectionStartIndex = 0;
		this.lastMaskSelectionEndIndex = 0;
	}

	/** @override */
	protected normalizeAttrs(attrs: Dictionary = {}): Dictionary {
		attrs.type = this.type;
		attrs.autocomplete = this.autocomplete;
		attrs.placeholder = this.placeholder;
		attrs.readonly = this.readonly;
		attrs.maxlength = this.maxlength;
		return attrs;
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('empty', 'text', (v) => v === '');
		this.sync.mod('readonly', 'readonly');
	}

	protected mounted(): void {
		this.$refs.input.value = this.text;
	}

	/**
	 * Handler: the input with a mask has got the focus
	 */
	protected onMaskFocus(): void {
		void mask.setCursorPositionAtFirstNonTerminal(this);
	}

	/**
	 * Handler: the input with a mask has lost the focus
	 */
	protected onMaskBlur(): void {
		mask.syncInputWithField(this);
	}

	/**
	 * Handler: value of the masked input has been changed and can be saved
	 */
	protected onMaskValueReady(): void {
		mask.saveSnapshot(this);
	}

	/**
	 * Handler: there is occur an input action on the masked input
	 */
	protected onMaskInput(): void {
		void mask.syncFieldWithInput(this);
	}

	/**
	 * Handler: the "backspace" button has been pressed on the masked input
	 * @param e
	 */
	protected onMaskBackspace(e: KeyboardEvent): void {
		void mask.onMaskBackspace(this, e);
	}

	/**
	 * Handler: one of "arrow" buttons has been pressed on the masked input
	 * @param e
	 */
	protected onMaskNavigate(e: KeyboardEvent | MouseEvent): void {
		mask.onMaskNavigate(this, e);
	}

	/**
	 * Handler: there is occur a keypress action on the masked input
	 *
	 * @param e
	 */
	protected onMaskKeyPress(e: KeyboardEvent): void {
		mask.onMaskKeyPress(this, e);
	}
}
