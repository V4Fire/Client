/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// tslint:disable:max-file-line-count

import $C = require('collection.js');
import symbolGenerator from 'core/symbol';
import keyCodes from 'core/key-codes';
import BlockValidators from 'form/b-input/modules/validators';
import iInput, {

	component,
	prop,
	field,
	system,
	wait,
	ModsDecl,
	ValidatorsDecl

} from 'super/i-input/i-input';

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
	D extends Dictionary = Dictionary
> extends iInput<V, FV, D> {
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
	 * Reset button for input
	 */
	@prop(Boolean)
	readonly resetButton: boolean = true;

	/**
	 * Input autocomplete mode
	 */
	@prop(String)
	readonly autocomplete: string = 'off';

	/**
	 * Input maximum value length
	 */
	@prop({type: String, required: false})
	readonly maxlength?: number;

	/**
	 * Icon before input
	 */
	@prop({type: String, required: false})
	readonly preIcon?: string;

	/**
	 * Component for .preIcon
	 */
	@prop(String)
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
	@prop(String)
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
	readonly regs: Dictionary<RegExp> = {};

	/**
	 * Input mask value
	 */
	@prop({type: String, required: false})
	readonly mask?: string;

	/**
	 * Mask placeholder
	 */
	@prop({type: String, watch: {fn: 'updateMask', immediate: true}})
	readonly maskPlaceholder: string = '_';

	/** @override */
	get value(): V {
		return <NonNullable<V>>this.getField('valueStore');
	}

	/** @override */
	set value(value: V) {
		this.setField('valueStore', value);

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
		rounding: [
			'none',
			'small',
			'normal',
			'big'
		],

		theme: [
			bInput.PARENT,
			'link'
		],

		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...<any>iInput.blockValidators,
		...BlockValidators
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

		init: (o, data) => o.link('valueProp', (val) => {
			val = val === undefined ? data.valueStore : val;
			return val !== undefined ? String(val) : '';
		})
	})

	protected valueBufferStore!: string;

	/**
	 * Value buffer
	 */
	protected get valueBuffer(): V {
		return <NonNullable<V>>this.getField('valueBufferStore');
	}

	/**
	 * Sets a value to the value buffer store
	 */
	protected set valueBuffer(value: V) {
		this.setField('valueBufferStore', value);
	}

	/**
	 * If true, then one tick of value buffer synchronization will be skipped
	 */
	@field()
	protected skipBuffer: boolean = false;

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
			{async: $a} = this,
			{input} = this.$refs;

		const
			group = {group: 'mask'};

		if (this.mask) {
			$a.on(input, 'mousedown keydown', this.onMaskNavigate, group);
			$a.on(input, 'mousedown keydown', this.onMaskValueReady, group);
			$a.on(input, 'mouseup keyup', this.onMaskValueReady, {
				options: {
					capture: true
				},

				...group
			});

			$a.on(input, this.b.is.Android ? 'keyup' : 'keypress', this.onMaskKeyPress, group);
			$a.on(input, 'keydown', this.onMaskBackspace, group);
			$a.on(input, 'input', this.onMaskInput, group);
			$a.on(input, 'focus', this.onMaskFocus, group);
			$a.on(input, 'blur', this.onMaskBlur, group);

			const
				value = <Array<string | RegExp>>[];

			let
				tpl = '',
				sys = false;

			$C(this.mask).forEach((el) => {
				if (el === '%') {
					sys = true;
					return;
				}

				tpl += sys ? this.maskPlaceholder : el;

				if (sys) {
					value.push(this.regs[el] || new RegExp(`\\${el}`));
					sys = false;

				} else {
					value.push(el);
				}
			});

			this._mask = {value, tpl};
			this._maskBuffer = '';
			this._lastMaskSelectionStartIndex = this._lastMaskSelectionEndIndex = 0;
			await this.applyMaskToValue(this.value, {updateBuffer: true});

		} else {
			$a.off(group);
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

			$C(mask).forEach((mask, i) => {
				const
					isRgxp = Object.isRegExp(mask);

				if (i < startPos || !selectionFalse && i > endPos) {
					if (isRgxp) {
						res += def(mask, i);

					} else {
						res += mask;
					}

					return;
				}

				if (isRgxp) {
					if (chunks.length) {
						while (chunks.length && !(<RegExp>mask).test(chunks[0])) {
							chunks.shift();
						}

						if (chunks.length) {
							res += chunks[0];
							chunks.shift();
							pos++;

						} else {
							res += def(mask, i);
						}

					} else {
						res += def(mask, i);
					}

				} else {
					res += mask;
				}
			});

		} else if (focused) {
			cursor = 'start';
			res = m ? m.tpl : '';
		}

		if (cursor === 'start') {
			cursor = $C(mask).one.search((el) => Object.isRegExp(el));
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

			if (this.b.is.iOS) {
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
			this.emit('actionChange', this.value);
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

		if (!this.mask && this.blockValueField === 'value') {
			this.emit('actionChange', this.value);
		}
	}

	/**
	 * Handler: mask focus
	 * @param e
	 */
	protected async onMaskFocus(e: FocusEvent): Promise<void> {
		if (this.mods.empty === 'true') {
			await this.applyMaskToValue('', {updateBuffer: true});
		}

		const
			m = this._mask;

		if (!m) {
			return;
		}

		const pos = $C(m.value).one.search((el) => Object.isRegExp(el)) || 0;
		this.$refs.input.setSelectionRange(pos, pos);
	}

	/**
	 * Handler: mask blur
	 * @param e
	 */
	protected onMaskBlur(e: Event): void {
		const
			m = this._mask;

		if (!m) {
			return;
		}

		if (this.valueBuffer === m.tpl) {
			this.value = <V>'';
		}
	}

	/**
	 * Handler: mask cursor position save
	 * @param e
	 */
	protected onMaskCursorReady(e: KeyboardEvent | MouseEvent): void {
		const {input} = this.$refs;
		this._lastMaskSelectionStartIndex = input.selectionStart;
		this._lastMaskSelectionEndIndex = input.selectionEnd;
	}

	/**
	 * Handler: mask value save
	 * @param e
	 */
	protected onMaskValueReady(e: KeyboardEvent | MouseEvent): void {
		this._maskBuffer = this.valueBuffer;
	}

	/**
	 * Raw data change handler
	 *
	 * @param value
	 * @emits actionChange(value: V)
	 */
	protected onRawDataChange(value: V): void {
		if (this.blockValueField === 'value') {
			this.emit('actionChange', value);
		}
	}

	/**
	 * Handler: mask input
	 * @emits actionChange(value: V)
	 */
	protected async onMaskInput(e: Event): Promise<void> {
		await this.applyMaskToValue(undefined, {
			start: this._lastMaskSelectionStartIndex,
			end: this._lastMaskSelectionEndIndex
		});

		this.onRawDataChange(this.value);
	}

	/**
	 * Backspace handler for the mask
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected async onMaskBackspace(e: KeyboardEvent): Promise<void> {
		const codes = {
			[keyCodes.BACKSPACE]: true,
			[keyCodes.DELETE]: true
		};

		if (!codes[e.keyCode]) {
			return;
		}

		e.preventDefault();

		const
			{input} = this.$refs;

		const
			selectionStart = input.selectionStart || 0,
			selectionEnd = input.selectionEnd || 0,
			selectionFalse = selectionStart === selectionEnd;

		const
			m = this._mask,
			mask = m && m.value,
			ph = this.maskPlaceholder;

		if (!m || !mask) {
			return;
		}

		let
			res = this.valueBuffer,
			pos = 0;

		if (e.keyCode === keyCodes.DELETE) {
			let
				start = selectionStart,
				end = selectionEnd;

			const chunks = $C(mask).to([] as string[]).reduce((arr, el, i) => {
				if (res && Object.isRegExp(el) && el.test(res[i])) {
					arr.push(res[i]);

				} else {
					if (i < selectionStart) {
						start--;
					}

					if (!selectionFalse && i < selectionEnd) {
						end--;
					}
				}

				return arr;
			});

			chunks.splice(start, selectionFalse ? 1 : end - start);
			res = <V>chunks.join('');

			if (res) {
				await this.applyMaskToValue(res, {cursor: selectionStart, maskBuffer: ''});

			} else {
				this.skipBuffer = true;
				this.value = <V>'';
				await this.applyMaskToValue('', {updateBuffer: true});
			}

			return;
		}

		const
			chunks = (<string>res).split('');

		let n = selectionEnd - selectionStart;
		n = n > 0 ? n : 1;

		while (n--) {
			const
				end = selectionEnd - n - 1;

			let
				maskEl = mask[end],
				prevMaskEl = '',
				i = end;

			if (!Object.isRegExp(maskEl) && selectionFalse) {
				prevMaskEl = maskEl;

				while (!Object.isRegExp(mask[--i]) && i > -1) {
					prevMaskEl += mask[i];
				}

				maskEl = mask[i];
			}

			if (Object.isRegExp(maskEl)) {
				pos = end - prevMaskEl.length;
				chunks[pos] = ph;
			}
		}

		res = <V>chunks.join('');

		let
			start = selectionFalse ? pos : selectionStart;

		while (start < mask.length && !Object.isRegExp(mask[start])) {
			start++;
		}

		if (res === m.tpl) {
			this.skipBuffer = true;
			this.value = <V>'';
			await this.applyMaskToValue('', {updateBuffer: true});

		} else {
			this.value = input.value = res;
			input.setSelectionRange(start, start);
		}

		this.onRawDataChange(this.value);
	}

	/**
	 * Handler: mask navigation by arrows
	 * @param e
	 */
	protected onMaskNavigate(e: KeyboardEvent | MouseEvent): void {
		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
			return;
		}

		const
			keyboardEvent = e instanceof KeyboardEvent,
			leftKey = (<KeyboardEvent>e).keyCode === keyCodes.LEFT;

		if (keyboardEvent ? !leftKey && (<KeyboardEvent>e).keyCode !== keyCodes.RIGHT : (<MouseEvent>e).button !== 0) {
			return;
		}

		const event = () => {
			const
				m = this._mask;

			if (!m) {
				return;
			}

			const
				mask = m.value,
				{input} = this.$refs;

			const
				selectionStart = input.selectionStart || 0,
				selectionEnd = input.selectionEnd || 0;

			let
				canChange = true,
				pos;

			if (keyboardEvent) {
				// tslint:disable-next-line:prefer-conditional-expression
				if (selectionStart !== selectionEnd) {
					pos = leftKey ? selectionStart : selectionEnd;

				} else {
					pos = leftKey ? selectionStart - 1 : selectionEnd + 1;
				}

			} else {
				pos = selectionStart;
			}

			if (selectionEnd === pos || keyboardEvent) {
				while (!Object.isRegExp(mask[pos])) {
					if (leftKey) {
						pos--;

						if (pos <= 0) {
							canChange = false;
							break;
						}

					} else {
						if (Object.isRegExp(mask[pos - 1])) {
							break;
						}

						pos++;
						if (pos >= mask.length) {
							canChange = false;
							break;
						}
					}
				}

				if (!canChange) {
					pos = $C(mask).one.search((el) => Object.isRegExp(el));
				}

				input.setSelectionRange(pos, pos);
			}
		};

		if (keyboardEvent || this.mods.focused !== 'true') {
			e.preventDefault();
			keyboardEvent && event();

		} else {
			this.async.setImmediate(event, {label: $$.setCursor});
		}
	}

	/**
	 * Handler: mask input from a keyboard
	 *
	 * @param e
	 * @emits actionChange(value: V)
	 */
	protected onMaskKeyPress(e: KeyboardEvent): void {
		const blacklist = {
			[keyCodes.TAB]: true
		};

		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || blacklist[e.keyCode] || !this.valueBuffer || !this._mask) {
			return;
		}

		e.preventDefault();

		const
			{input} = this.$refs;

		const
			selectionStart = input.selectionStart || 0,
			selectionEnd = input.selectionEnd || 0;

		const
			res = this.valueBuffer.split(''),
			mask = this._mask.value;

		let
			insert = true,
			n = selectionEnd - selectionStart + 1,
			start = selectionStart,
			inputVal = String.fromCharCode(e.charCode);

		while (n--) {
			const
				end = selectionEnd - n;

			let
				maskEl = mask[end],
				nextMaskEl = '',
				i = end;

			if (insert && !Object.isRegExp(maskEl)) {
				nextMaskEl = maskEl;

				while (!Object.isRegExp(mask[++i]) && i < mask.length) {
					nextMaskEl += mask[i];
				}

				maskEl = mask[i];
			}

			if (Object.isRegExp(maskEl) && (!insert || maskEl.test(inputVal))) {
				let pos = end + nextMaskEl.length;
				res[pos] = inputVal;

				if (insert) {
					pos++;
					start = pos;
					insert = false;
					inputVal = this.maskPlaceholder;
				}
			}
		}

		while (start < mask.length && !Object.isRegExp(mask[start])) {
			start++;
		}

		this.value = input.value = <V>res.join('');
		input.setSelectionRange(start, start);

		this.onRawDataChange(this.value);
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		this.bindModTo('empty', 'valueBufferStore', (v) => !v);
	}

	/** @override */
	protected initValueEvents(): void {
		super.initValueEvents();
		this.watch('valueBufferStore', async (val = '') => {
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
