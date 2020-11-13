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
	wait,

	ModsDecl

} from 'super/i-input/i-input';

//#if runtime has iInputText/mask
import * as mask from 'super/i-input-text/modules/mask';
//#endif

import { CompiledMask } from 'super/i-input-text/interface';

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

	/**
	 * Text value of the input
	 * @see [[iInputText.text]]
	 */
	get text(): string {
		return this.field.get<string>('textStore')!;
	}

	/** @override */
	set value(value: string) {
		this.field.set('textStore', value);

		if (this.skipBuffer) {
			this.skipBuffer = false;
			return;
		}

		if (this.textBuffer !== value) {
			this.textBuffer = value;

			const
				{input} = this.$refs;

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (input != null) {
				input.value = value;
			}
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
	 * If true, then the next tick of the text buffer synchronization will be skipped
	 */
	@system()
	protected skipBuffer: boolean = false;

	/**
	 * Text value store of the input
	 * @see [[iInputText.textProp]]
	 */
	@system((o) => o.sync.link())
	protected textStore!: string;

	/**
	 * Text buffer
	 */
	@system({
		after: 'textStore',
		init: (o, data) => o.sync.link('textProp', (val) => {
			val = val === undefined ? data.textStore : val;
			return val !== undefined ? String(val) : '';
		})
	})

	protected textBuffer!: string;

	/**
	 * Object of the compiled mask
	 * @see [[iInputText.mask]]
	 */
	@system()
	protected compiledMask?: CompiledMask;

	/**
	 * Temporary mask buffer
	 */
	@system()
	protected maskedTextBuffer?: string;

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
	 * @emits `selectAll()`
	 */
	@wait('ready', {label: $$.selectAll})
	selectAll(): CanPromise<boolean> {
		const
			{input} = this.$refs;

		if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length) {
			input.select();
			this.emit('selectAll');
			return true;
		}

		return false;
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

	/**
	 *
	 * @protected
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

		this.maskedTextBuffer = '';
		this.lastMaskSelectionStartIndex = 0;
		this.lastMaskSelectionEndIndex = 0;
	}

	/**
	 * Applies the mask to a component value
	 *
	 * @param [value]
	 * @param [updateBuffer] - if true, then wil be updated only the component value buffer
	 * @param [start] - selection start
	 * @param [end] - selection end
	 * @param [cursor] - cursor position (or constant 'start')
	 * @param [maskBuffer] - buffer value for the mask
	 */
	@wait('ready', {label: $$.applyMaskToValue})
	async applyMaskToValue(
		value: CanUndef<string> = this.valueBuffer,

		{
			updateBuffer,
			start,
			end,
			cursor,
			maskBuffer = this._maskBuffer
		}: {
			updateBuffer?: boolean;
			start?: Nullable<number>;
			end?: Nullable<number>;
			cursor?: Nullable<number | string>;
			maskBuffer?: string;
		} = {}

	): Promise<void> {
		let
			startPos,
			endPos;

		if (!value) {
			startPos = endPos = 0;

		} else {
			startPos = start || 0;
			endPos = end || 0;
		}

		const
			m = this._mask,
			mask = m && m.value;

		if (!m || !mask) {
			return;
		}

		const
			focused = this.mods.focused === 'true',
			selectionFalse = startPos === endPos,
			buffer = maskBuffer;

		let
			res = '',
			pos = -1;

		if (value) {
			const
				chunks = Array.from(value).slice(startPos, !selectionFalse ? endPos : undefined),
				ph = this.maskPlaceholder,
				def = (mask, i) => buffer && mask.test(buffer[i]) ? buffer[i] : ph;

			for (let i = 0; i < mask.length; i++) {
				const
					val = mask[i],
					isRgxp = Object.isRegExp(val);

				if (i < startPos || !selectionFalse && i > endPos) {
					if (isRgxp) {
						res += def(val, i);

					} else {
						res += val;
					}

					break;
				}

				if (isRgxp) {
					if (chunks.length) {
						while (chunks.length && !(<RegExp>val).test(chunks[0])) {
							chunks.shift();
						}

						if (chunks.length) {
							res += chunks[0];
							chunks.shift();
							pos++;

						} else {
							res += def(val, i);
						}

					} else {
						res += def(val, i);
					}

				} else {
					res += val;
				}
			}

		} else if (focused) {
			cursor = 'start';
			res = m ? m.tpl : '';
		}

		if (cursor === 'start') {
			for (let i = 0; i < mask.length; i++) {
				if (Object.isRegExp(mask[i])) {
					cursor = i;
					break;
				}
			}
		}

		const {input} = this.$refs;
		this[updateBuffer ? 'valueBuffer' : 'value'] = input.value = res;

		if (focused) {
			pos = cursor != null ? Number(cursor) : selectionFalse ? startPos + pos + 1 : endPos;
			while (pos < mask.length && !Object.isRegExp(mask[pos])) {
				pos++;
			}

			this._lastMaskSelectionStartIndex = this._lastMaskSelectionEndIndex = pos;
			input.setSelectionRange(pos, pos);
		}
	}

	/**
	 * Handler: the input with a mask has got the focus
	 * @param e
	 */
	protected async onMaskFocus(e: FocusEvent): Promise<void> {
		return mask.onMaskFocus(this, e);
	}

	/**
	 * Handler: the input with a mask has lost the focus
	 * @param e
	 */
	protected onMaskBlur(e: Event): void {
		return mask.onMaskBlur(this, e);
	}

	/**
	 * Handler: mask cursor position save
	 * @param e
	 */
	protected onMaskCursorReady(e: KeyboardEvent | MouseEvent): void {
		return mask.onMaskCursorReady(this, e);
	}

	/**
	 * Handler: mask value save
	 * @param e
	 */
	protected onMaskValueReady(e: KeyboardEvent | MouseEvent): void {
		return mask.onMaskValueReady(this, e);
	}

	/**
	 * Handler: mask input
	 * @emits actionChange(value: V)
	 */
	protected async onMaskInput(e: Event): Promise<void> {
		return mask.onMaskInput(this);
	}

	/**
	 * Backspace handler for the mask
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected async onMaskBackspace(e: KeyboardEvent): Promise<void> {
		return mask.onMaskBackspace(this, e);
	}

	/**
	 * Handler: mask navigation by arrows
	 * @param e
	 */
	protected onMaskNavigate(e: KeyboardEvent | MouseEvent): void {
		return mask.onMaskNavigate(this, e);
	}

	/**
	 * Handler: mask input from a keyboard
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected onMaskKeyPress(e: KeyboardEvent): void {
		return mask.onMaskKeyPress(this, e);
	}
}
