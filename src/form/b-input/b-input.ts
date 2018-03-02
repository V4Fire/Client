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
import KeyCodes from 'core/keyCodes';
import BlockValidators from 'form/b-input/modules/validators';
import iInput, {

	component,
	prop,
	field,
	system,
	wait,
	hook,
	ModsDecl,
	ValidatorsDecl,
	PARENT

} from 'super/i-input/i-input';

export * from 'super/i-input/i-input';

export const
	$$ = symbolGenerator();

@component()
export default class bInput<T extends Dictionary = Dictionary> extends iInput<T> {
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
	readonly preIconComponent: string = 'b-icon';

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
	readonly iconComponent: string = 'b-icon';

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
	readonly regs: Dictionary = {};

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

	/** @inheritDoc */
	static mods: ModsDecl = {
		rounding: [
			['none'],
			'small',
			'normal',
			'big'
		],

		theme: [
			PARENT,
			'link'
		],

		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	static blockValidators: ValidatorsDecl = {
		...iInput.blockValidators,
		...BlockValidators
	};

	/** @override */
	protected $refs!: {input: HTMLInputElement};

	/**
	 * Value buffer
	 */
	@field({
		init: (o) => o.link('valueProp'),
		watch: {
			fn: 'onValueBufferUpdate',
			immediate: true
		}
	})

	protected valueBufferStore: any;

	/**
	 * Value buffer
	 */
	protected get valueBuffer(): string | undefined {
		return this.valueBufferStore;
	}

	/**
	 * Sets a value to the value buffer store
	 */
	protected set valueBuffer(value: string | undefined) {
		this.valueBufferStore = value;
	}

	/**
	 * If true, then one tick of value buffer synchronization will be skipped
	 */
	@field()
	protected skipBuffer: boolean = false;

	/** @private */
	@system()
	private _lastMaskSelectionStartIndex?: number;

	/** @private */
	@system()
	private _lastMaskSelectionEndIndex?: number;

	/** @private */
	@system()
	private _maskBuffer?: string;

	/** @private */
	@system()
	private _mask?: {value: Array<string | RegExp>; tpl: string};

	/** @override */
	get value(): any {
		return this.valueStore !== undefined ? String(this.valueStore) : '';
	}

	/** @override */
	set value(value: any) {
		this.valueStore = value;

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
	get default(): string {
		return this.defaultProp !== undefined ? String(this.defaultProp) : '';
	}

	/** @override */
	async clear(): Promise<boolean> {
		this.skipBuffer = true;

		if (this.mask) {
			await this.applyMaskToValue('', {updateBuffer: true});

		} else {
			this.valueBuffer = undefined;
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
			group = 'mask';

		if (this.mask) {
			$a.on(input, 'mousedown keydown', this.onMaskNavigate, {group});
			$a.on(input, 'mousedown keydown', this.onMaskValueReady, {group});
			$a.on(input, 'mouseup keyup', this.onMaskValueReady, {
				group,
				options: {
					capture: true
				}
			});

			$a.on(input, this.b.is.Android ? 'keyup' : 'keypress', this.onMaskKeyPress, {group});
			$a.on(input, 'keydown', this.onMaskBackspace, {group});
			$a.on(input, 'input', this.onMaskInput, {group});
			$a.on(input, 'focus', this.onMaskFocus, {group});
			$a.on(input, 'blur', this.onMaskBlur, {group});

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
			$a.off({group});
			this._mask = undefined;
		}
	}

	/**
	 * Applies the mask to a block value
	 *
	 * @param [value]
	 * @param [updateBuffer] - if true, then wil be updated only the block value buffer
	 * @param [start] - selection start
	 * @param [end] - selection end
	 * @param [cursor] - cursor position (or constant 'start')
	 * @param [maskBuffer] - buffer value for the mask
	 */
	@wait('ready', {label: $$.applyMaskToValue})
	async applyMaskToValue(
		value: string | undefined = this.valueBuffer,

		{
			updateBuffer,
			start = 0,
			end = start,
			cursor,
			maskBuffer = this._maskBuffer
		}: {
			updateBuffer?: boolean;
			start?: number;
			end?: number;
			cursor?: number | string | null;
			maskBuffer?: string;
		} = {}

	): Promise<void> {
		if (!value) {
			start = end = 0;
		}

		const
			m = this._mask,
			mask = m && m.value;

		if (!m || !mask) {
			return;
		}

		const
			focused = this.mods.focused === 'true',
			selectionFalse = start === end,
			buffer = maskBuffer;

		let
			res = '',
			pos = -1;

		if (value) {
			const
				chunks = Array.from(value).slice(start, !selectionFalse ? end : undefined),
				ph = this.maskPlaceholder,
				def = (mask, i) => buffer && mask.test(buffer[i]) ? buffer[i] : ph;

			$C(mask).forEach((mask, i) => {
				const
					isRgxp = Object.isRegExp(mask);

				if (i < start || !selectionFalse && i > end) {
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
		this[updateBuffer ? 'valueBuffer' : 'value'] = input.value = res;

		if (focused) {
			pos = cursor != null ? Number(cursor) : selectionFalse ? start + pos + 1 : end;
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

		if (input.hasAttribute('readonly')) {
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
	protected onValueBufferUpdate(value: any): void {
		if (!this.mask) {
			this.value = value;
		}

		super.onFocus();
	}

	/**
	 * Handler: clear
	 *
	 * @param e
	 * @emits actionChange(value: string)
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
	 * @emits actionChange(value: string)
	 */
	protected async onEdit(e: Event): Promise<void> {
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
			this.value = undefined;
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
	 * @emits actionChange
	 */
	protected onRawDataChange(value: any): void {
		if (this.blockValueField === 'value') {
			this.emit('actionChange', value);
		}
	}

	/**
	 * Handler: mask input
	 * @emits actionChange(value: string)
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
	 * @emits actionChange(value: string)
	 */
	protected async onMaskBackspace(e: KeyboardEvent): Promise<void> {
		const codes = {
			[KeyCodes.BACKSPACE]: true,
			[KeyCodes.DELETE]: true
		};

		if (!codes[e.keyCode]) {
			return;
		}

		e.preventDefault();

		const
			{input} = this.$refs,
			{selectionStart, selectionEnd} = input,
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

		if (e.keyCode === KeyCodes.DELETE) {
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
			res = chunks.join('');

			if (res) {
				await this.applyMaskToValue(res, {cursor: selectionStart, maskBuffer: ''});

			} else {
				this.skipBuffer = true;
				this.value = undefined;
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

		res = chunks.join('');

		let
			start = selectionFalse ? pos : selectionStart;

		while (start < mask.length && !Object.isRegExp(mask[start])) {
			start++;
		}

		if (res === m.tpl) {
			this.skipBuffer = true;
			this.value = undefined;
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
			leftKey = (<KeyboardEvent>e).keyCode === KeyCodes.LEFT;

		if (keyboardEvent ? !leftKey && (<KeyboardEvent>e).keyCode !== KeyCodes.RIGHT : (<MouseEvent>e).button !== 0) {
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
				{input} = this.$refs,
				{selectionStart, selectionEnd} = input;

			let
				canChange = true,
				pos;

			if (keyboardEvent) {
				// tslint:disable-next-line
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
	 * @emits actionChange(value: string)
	 */
	protected onMaskKeyPress(e: KeyboardEvent): void {
		const blacklist = {
			[KeyCodes.TAB]: true
		};

		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || blacklist[e.keyCode] || !this.valueBuffer || !this._mask) {
			return;
		}

		e.preventDefault();

		const
			{input} = this.$refs,
			{selectionStart, selectionEnd} = input;

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

		this.value = input.value = res.join('');
		input.setSelectionRange(start, start);

		this.onRawDataChange(this.value);
	}

	/** @override */
	protected initValueEvents(): void {
		super.initValueEvents();

		this.bindModTo(
			'empty',
			'valueBufferStore',
			(v) => !v
		);

		this.$watch(
			'valueBufferStore', async (val = '') => {
			try {
				await this.waitRef('input', {label: $$.valueBufferStoreModel});

				const
					{input} = this.$refs;

				if (input.value !== val) {
					input.value = val;
				}

			} catch (_) {}
		}, {immediate: true});
	}

	/**
	 * Initializes events for input
	 */
	@hook('mounted')
	protected initInputEvents(): void {
		this.async.on(this.$el, 'input', (e) => this.valueBufferStore = e.target.value || '', {
			label: $$.valueBufferStoreModelInput
		});
	}
}
