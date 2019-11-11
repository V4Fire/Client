/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iWidth from 'traits/i-width/i-width';
import iSize from 'traits/i-size/i-size';
import iIcon from 'traits/i-icon/i-icon';

import iInput, {

	component,
	prop,
	field,
	system,
	wait,
	ModsDecl,
	ValidatorsDecl

} from 'super/i-input/i-input';

import Validators from 'form/b-input/modules/validators';

//#if runtime has bInput/mask
import * as mask from 'form/b-input/modules/mask';
//#endif

export * from 'super/i-input/i-input';

export type Value = string;
export type FormValue = Value;

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	}
})

export default class bInput<
	V extends Value = Value,
	FV extends FormValue = FormValue,
	D extends object = Dictionary
> extends iInput<V, FV, D> implements iWidth, iSize, iIcon {
	/** @override */
	@prop({type: String, required: false})
	readonly valueProp?: V;

	/** @override */
	@prop({type: String, required: false})
	readonly defaultProp?: V;

	/**
	 * Input type
	 */
	@prop(String)
	readonly type: string = 'text';

	/**
	 * Input autocomplete mode
	 */
	@prop(String)
	readonly autocomplete: string = 'off';

	/**
	 * Input placeholder
	 */
	@prop({type: String, required: false})
	readonly placeholder?: string;

	/**
	 * Input pattern
	 */
	@prop({type: String, required: false})
	readonly pattern?: string;

	/**
	 * Readonly flag
	 */
	@prop({type: Boolean, required: false})
	readonly readonly?: boolean;

	/**
	 * Input maximum value length
	 */
	@prop({type: Number, required: false})
	readonly maxlength?: number;

	/**
	 * Input minimum value (for number and date)
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly min?: number | string | Date;

	/**
	 * Input maximum value (for number and date)
	 */
	@prop({type: [Number, String, Date], required: false})
	readonly max?: number | string | Date;

	/**
	 * Reset button for input
	 */
	@prop(Boolean)
	readonly resetButton: boolean = true;

	/**
	 * Icon before input
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop({type: String, required: false})
	readonly preIconComponent?: string;

	/**
	 * Tooltip text for the preIcon
	 */
	@prop({type: String, required: false})
	readonly preIconHint?: string;

	/**
	 * Tooltip position for the preIcon
	 */
	@prop({type: String, required: false})
	readonly preIconHintPos?: string;

	/**
	 * Icon after input
	 */
	@prop({type: String, required: false})
	readonly icon?: string;

	/**
	 * Component for .icon
	 */
	@prop({type: String, required: false})
	readonly iconComponent?: string;

	/**
	 * Tooltip text for the icon
	 */
	@prop({type: String, required: false})
	readonly iconHint?: string;

	/**
	 * Tooltip position for the icon
	 */
	@prop({type: String, required: false})
	readonly iconHintPos?: string;

	/**
	 * RegExp map
	 * (for using with .mask)
	 */
	@prop(Object)
	readonly regExps: Dictionary<RegExp> = {};

	/**
	 * Input mask value
	 */
	@prop({type: String, required: false})
	readonly mask?: string;

	/**
	 * Mask placeholder
	 */
	@prop({type: String, watch: {fn: 'updateMask', immediate: true, provideArgs: false}})
	readonly maskPlaceholder: string = '_';

	/**
	 * Initial number of mask repetitions
	 */
	@prop({type: [Number, Boolean], required: false})
	readonly maskRepeatProp?: number | boolean;

	/**
	 * Delimiter for a mask value (if the mask is repeated)
	 */
	@prop({type: String, required: false})
	readonly maskDelimiter: string = ' ';

	/**
	 * Should mask be repeated infinitely
	 */
	get isMaskInfinite(): boolean {
		return this.maskRepeatProp === true;
	}

	/** @override */
	get value(): V {
		return <NonNullable<V>>this.field.get('valueStore');
	}

	/** @override */
	set value(value: V) {
		this.field.set('valueStore', value);

		if (this.skipBuffer) {
			this.skipBuffer = false;
			return;
		}

		if (this.valueBuffer !== value) {
			this.valueBuffer = value;

			const
				{input} = this.$refs;

			if (input) {
				input.value = value;
			}
		}
	}

	/** @override */
	get default(): unknown {
		return this.defaultProp != null ? String(this.defaultProp) : '';
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
	static validators: ValidatorsDecl = {
		...<any>iInput.validators,
		...Validators
	};

	/** @override */
	protected readonly $refs!: {input: HTMLInputElement};

	/**
	 * Value buffer
	 */
	@field({
		after: 'valueStore',
		watch: {
			fn: 'onValueBufferUpdate',
			immediate: true
		},

		init: (o, data) => o.sync.link('valueProp', (val) => {
			val = val === undefined ? data.valueStore : val;
			return val !== undefined ? String(val) : '';
		})
	})

	protected valueBufferStore!: string;

	/**
	 * Value buffer
	 */
	protected get valueBuffer(): V {
		return <NonNullable<V>>this.field.get('valueBufferStore');
	}

	/**
	 * Sets a value to the value buffer store
	 */
	protected set valueBuffer(value: V) {
		this.field.set('valueBufferStore', value);
	}

	/**
	 * If true, then one tick of value buffer synchronization will be skipped
	 */
	@field()
	protected skipBuffer: boolean = false;

	/**
	 * Number of mask repetitions
	 */
	@system((o) => o.sync.link((v) => v === true ? 42 : v || 1))
	protected maskRepeat!: number;

	/**
	 * Temporary last selection start index
	 */
	@system()
	private _lastMaskSelectionStartIndex?: Nullable<number>;

	/**
	 * Temporary last selection end index
	 */
	@system()
	private _lastMaskSelectionEndIndex?: Nullable<number>;

	/**
	 * Temporary mask buffer
	 */
	@system()
	private _maskBuffer?: string;

	/**
	 * Temporary mask value
	 */
	@system()
	private _mask?: {value: Array<string | RegExp>; tpl: string};

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}

	/** @override */
	async clear(): Promise<boolean> {
		this.skipBuffer = true;

		if (this.mask) {
			await this.applyMaskToValue('', {updateBuffer: true});

		} else {
			this.valueBuffer = <V>'';

			const
				{input} = this.$refs;

			if (input) {
				input.value = '';
			}
		}

		return super.clear();
	}

	/**
	 * Selects all content of the input
	 * @emits selectAll()
	 */
	@wait('ready', {label: $$.selectAll})
	async selectAll(): Promise<boolean> {
		const
			{input} = this.$refs;

		if (input.selectionStart !== 0 || input.selectionEnd !== input.value.length) {
			input.select();
			this.emit('selectAll');
			return true;
		}

		return false;
	}

	/**
	 * Updates the mask value
	 */
	@wait('ready', {label: $$.updateMask})
	async updateMask(): Promise<void> {
		const
			{async: $a, maskDelimiter} = this,
			{input} = this.$refs;

		const group = {group: 'mask'};
		$a.off(group);

		if (this.mask) {
			$a.on(input, 'mousedown keydown', this.onMaskNavigate, group);
			$a.on(input, 'mousedown keydown', this.onMaskValueReady, group);
			$a.on(input, 'mouseup keyup', this.onMaskValueReady, {
				options: {
					capture: true
				},

				...group
			});

			$a.on(input, 'keypress', this.onMaskKeyPress, group);
			$a.on(input, 'keydown', this.onMaskBackspace, group);
			$a.on(input, 'input', this.onMaskInput, group);
			$a.on(input, 'focus', this.onMaskFocus, group);
			$a.on(input, 'blur', this.onMaskBlur, group);

			const
				value = <Array<string | RegExp>>[];

			let
				tpl = '',
				sys = false;

			if (this.mask) {
				for (let o = this.mask, i = 0, j = 0; i < o.length && j < this.maskRepeat; i++) {
					const
						el = o[i];

					if (el === '%') {
						sys = true;
						continue;
					}

					tpl += sys ? this.maskPlaceholder : el;

					if (sys) {
						value.push(this.regExps[el] || new RegExp(`\\${el}`));
						sys = false;

					} else {
						value.push(el);
					}

					if (i === o.length - 1) {
						i = -1;
						j++;

						if (j < this.maskRepeat) {
							tpl += maskDelimiter;
							value.push(maskDelimiter);
						}
					}
				}
			}

			this._mask = {value, tpl};
			this._maskBuffer = '';
			this._lastMaskSelectionStartIndex = this._lastMaskSelectionEndIndex = 0;
			await this.applyMaskToValue(this.value, {updateBuffer: true});

		} else {
			this._mask = undefined;
		}
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
		this[updateBuffer ? 'valueBuffer' : 'value'] = input.value = <V>res;

		if (focused) {
			pos = cursor != null ? Number(cursor) : selectionFalse ? startPos + pos + 1 : endPos;
			while (pos < mask.length && !Object.isRegExp(mask[pos])) {
				pos++;
			}

			this._lastMaskSelectionStartIndex = this._lastMaskSelectionEndIndex = pos;
			input.setSelectionRange(pos, pos);
		}
	}

	/** @override */
	protected onFocus(): void {
		const
			{input} = this.$refs;

		if (!this.readonly && input.hasAttribute('readonly')) {
			input.removeAttribute('readonly');

			if (this.browser.is.iOS) {
				input.blur();
				input.focus();
			}
		}

		super.onFocus();
	}

	/**
	 * Handler: value buffer update
	 * @param value
	 */
	protected onValueBufferUpdate(value: V): void {
		if (!this.mask) {
			this.value = value;
		}
	}

	/**
	 * Handler: clear
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected async onClear(e: MouseEvent): Promise<void> {
		if (await this.clear()) {
			this.emit('actionChange', this[this.valueKey]);
		}
	}

	/**
	 * Handler: edit
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected async onEdit(e: Event): Promise<void> {
		this.valueBufferStore =
			(<HTMLInputElement>e.target).value || '';

		if (!this.mask && this.valueKey === 'value') {
			this.emit('actionChange', this[this.valueKey]);
		}
	}

	/**
	 * Handler: raw data change
	 *
	 * @param value
	 * @emits actionChange(value: V)
	 */
	protected onRawDataChange(value: V): void {
		if (this.valueKey === 'value') {
			this.emit('actionChange', value);
		}
	}

	/**
	 * Handler: mask focus
	 * @param e
	 */
	protected async onMaskFocus(e: FocusEvent): Promise<void> {
		return mask.onMaskFocus(this, e);
	}

	/**
	 * Handler: mask blur
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

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('empty', 'valueBufferStore', (v) => !v);
		this.sync.mod('readonly', 'readonly');
	}

	/** @override */
	protected initValueEvents(): void {
		super.initValueEvents();
		this.watch('valueBuffer', async (val = '') => {
			try {
				const
					input = await this.waitRef<HTMLInputElement>('input', {label: $$.valueBufferStoreModel});

				if (input.value !== val) {
					input.value = <V>val;
				}

			} catch {}
		}, {immediate: true});
	}
}
