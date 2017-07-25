'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import iInput from 'super/i-input/i-input';
import blockValidators from './modules/validators';
import keyCodes from 'core/keyCodes';
import { abstract, field, watch, wait, mixin, bindModTo, PARENT } from 'super/i-block/i-block';
import { component } from 'core/component';

const
	$C = require('collection.js');

export const
	$$ = new Store();

@component()
export default class bInput extends iInput {
	/**
	 * Input type
	 */
	type: ?string = 'text';

	/**
	 * Input placeholder
	 */
	placeholder: ?string;

	/**
	 * Input pattern
	 */
	pattern: ?string;

	/**
	 * Reset button for input
	 */
	resetButton: boolean = true;

	/**
	 * Input autocomplete mode
	 */
	autocomplete: ?string = 'off';

	/**
	 * Input maximum value length
	 */
	maxlength: ?number;

	/**
	 * Icon before input
	 */
	preIcon: ?string;

	/**
	 * Component for .preIcon
	 */
	preIconComponent: ?string = 'b-icon';

	/**
	 * Tooltip text for the preIcon
	 */
	preIconHint: ?string;

	/**
	 * Tooltip position for the preIcon
	 */
	preIconHintPos: ?string;

	/**
	 * Icon after input
	 */
	icon: ?string;

	/**
	 * Component for .icon
	 */
	iconComponent: ?string = 'b-icon';

	/**
	 * Tooltip text for the icon
	 */
	iconHint: ?string;

	/**
	 * Tooltip position for the icon
	 */
	iconHintPos: ?string;

	/**
	 * RegExp map
	 * (for using with .mask)
	 */
	regs: Object = {};

	/**
	 * Input mask value
	 */
	mask: ?string;

	/**
	 * Mask placeholder
	 */
	@watch('updateMask', {immediate: true})
	maskPlaceholder: string = '_';

	/**
	 * Value buffer
	 */
	@watch('onValueBufferUpdate', {immediate: true})
	@field((o) => o.link('valueProp'))
	valueBufferStore: any;

	/**
	 * If true, then one tick of value buffer synchronization will be skipped
	 */
	@field()
	skipBuffer: boolean = false;

	/** @private */
	@abstract
	_lastMaskSelectionStartIndex: ?number;

	/** @private */
	@abstract
	_lastMaskSelectionEndIndex: ?number;

	/** @private */
	@abstract
	_maskBuffer: ?string;

	/** @private */
	@abstract
	_mask: ?{value: Array<string>, tpl: string};

	/**
	 * Value buffer
	 */
	get valueBuffer(): string {
		return this.valueBufferStore;
	}

	/**
	 * Sets a value to the value buffer store
	 */
	set valueBuffer(value: string) {
		this.valueBufferStore = value;
	}

	/** @override */
	get $refs(): {input: HTMLInputElement} {}

	/** @inheritDoc */
	static mods = {
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

		@bindModTo('valueBufferStore', (v) => !v)
		empty: [
			'true',
			'false'
		]
	};

	/** @override */
	@mixin
	static blockValidators = blockValidators;

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
	async clear(): boolean {
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
	async selectAll(): boolean {
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
	async updateMask() {
		const
			{async: $a} = this,
			{input} = this.$refs;

		if (this.mask) {
			$a.on(input, 'mousedown keydown', {
				group: 'mask',
				fn: this.onMaskNavigate
			});

			$a.on(input, 'mousedown keydown', {
				group: 'mask',
				fn: this.onMaskValueReady
			});

			$a.on(input, 'mouseup keyup', {
				group: 'mask',
				fn: this.onMaskCursorReady
			}, true);

			$a.on(input, this.b.is.Android ? 'keyup' : 'keypress', {
				group: 'mask',
				fn: this.onMaskKeyPress
			});

			$a.on(input, 'keydown', {
				group: 'mask',
				fn: this.onMaskBackspace
			});

			$a.on(input, 'input', {
				group: 'mask',
				fn: this.onMaskInput
			});

			$a.on(input, 'focus', {
				group: 'mask',
				fn: this.onMaskFocus
			});

			$a.on(input, 'blur', {
				group: 'mask',
				fn: this.onMaskBlur
			});

			const
				value = [];

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
			$a.off({group: 'mask'});
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
		value?: string = this.valueBuffer,
		{updateBuffer, start = 0, end = start, cursor, maskBuffer = this._maskBuffer}: {
			updateBuffer?: boolean,
			start?: number,
			end?: number,
			cursor?: number | string,
			maskBuffer?: string
		} = {}

	) {
		if (!value) {
			start = end = 0;
		}

		const
			m = this._mask,
			mask = m.value;

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
						while (chunks.length && !mask.test(chunks[0])) {
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
			res = m.tpl;
		}

		if (cursor === 'start') {
			cursor = $C(mask).one.search((el) => Object.isRegExp(el));
		}

		const {input} = this.$refs;
		this[updateBuffer ? 'valueBuffer' : 'value'] = input.value = res;

		if (focused) {
			pos = cursor != null ? cursor : selectionFalse ? start + pos + 1 : end;
			while (pos < mask.length && !Object.isRegExp(mask[pos])) {
				pos++;
			}

			this._lastMaskSelectionStartIndex = this._lastMaskSelectionEndIndex = pos;
			input.setSelectionRange(pos, pos);
		}
	}

	/** @override */
	onFocus() {
		const
			{input} = this.$refs;

		if (input.hasAttribute('readonly')) {
			input.removeAttribute('readonly');

			if (this.b.is.iOS) {
				input.blur();
				input.focus();
			}
		}

		super.onFocus(...arguments);
	}

	/**
	 * Handler: value buffer update
	 * @param value
	 */
	onValueBufferUpdate(value: any) {
		if (!this.mask) {
			this.value = value;
		}
	}

	/* eslint-disable no-unused-vars */

	/**
	 * Handler: clear
	 *
	 * @param e
	 * @emits actionChange(value: string)
	 */
	async onClear(e: MouseEvent) {
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
	async onEdit(e: InputEvent) {
		if (!this.mask && this.blockValueField === 'value') {
			this.emit('actionChange', this.value);
		}
	}

	/**
	 * Handler: mask focus
	 * @param e
	 */
	async onMaskFocus(e: FocusEvent) {
		if (this.mods.empty === 'true') {
			await this.applyMaskToValue('', {updateBuffer: true});
		}

		const pos = $C(this._mask.value).one.search((el) => Object.isRegExp(el));
		this.$refs.input.setSelectionRange(pos, pos);
	}

	/**
	 * Handler: mask blur
	 * @param e
	 */
	onMaskBlur(e: Event) {
		if (this.valueBuffer === this._mask.tpl) {
			this.value = undefined;
		}
	}

	/**
	 * Handler: mask cursor position save
	 * @param e
	 */
	onMaskCursorReady(e: KeyboardEvent | MouseEvent) {
		const {input} = this.$refs;
		this._lastMaskSelectionStartIndex = input.selectionStart;
		this._lastMaskSelectionEndIndex = input.selectionEnd;
	}

	/**
	 * Handler: mask value save
	 * @param e
	 */
	onMaskValueReady(e: KeyboardEvent | MouseEvent) {
		this._maskBuffer = this.valueBuffer;
	}

	/**
	 * Raw data change handler
	 *
	 * @param value
	 * @emits actionChange
	 */
	onRawDataChange(value: any) {
		if (this.blockValueField === 'value') {
			this.emit('actionChange', value);
		}
	}

	/**
	 * Handler: mask input
	 * @emits actionChange(value: string)
	 */
	async onMaskInput(e: InputEvent) {
		await this.applyMaskToValue(undefined, {
			start: this._lastMaskSelectionStartIndex,
			end: this._lastMaskSelectionEndIndex
		});

		this.onRawDataChange(this.value);
	}

	/* eslint-enable no-unused-vars */

	/**
	 * Backspace handler for the mask
	 *
	 * @param e
	 * @emits actionChange(value: string)
	 */
	async onMaskBackspace(e: KeyboardEvent) {
		const codes = {
			[keyCodes.BACKSPACE]: true,
			[keyCodes.DELETE]: true
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
			mask = m.value,
			ph = this.maskPlaceholder;

		let
			res = this.valueBuffer,
			pos = 0;

		if (e.keyCode === keyCodes.DELETE) {
			let
				start = selectionStart,
				end = selectionEnd;

			const chunks = $C(mask).reduce((arr, el, i) => {
				if (Object.isRegExp(el) && el.test(res[i])) {
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
			}, []);

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
			chunks = res.split('');

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
	onMaskNavigate(e: KeyboardEvent | MouseEvent) {
		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
			return;
		}

		const
			keyboardEvent = e instanceof KeyboardEvent,
			leftKey = e.keyCode === keyCodes.LEFT;

		if (keyboardEvent ? !leftKey && e.keyCode !== keyCodes.RIGHT : e.button !== 0) {
			return;
		}

		const event = () => {
			const
				mask = this._mask.value;

			const
				{input} = this.$refs,
				{selectionStart, selectionEnd} = input;

			let
				canChange = true,
				pos;

			if (keyboardEvent) {
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
			this.async.setImmediate({fn: event, label: $$.setCursor});
		}
	}

	/**
	 * Handler: mask input from a keyboard
	 *
	 * @param e
	 * @emits actionChange(value: string)
	 */
	onMaskKeyPress(e: KeyboardEvent) {
		const blacklist = {
			[keyCodes.TAB]: true
		};

		if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || blacklist[e.keyCode]) {
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
			inputVal = String.fromCharCode(String(e.charCode));

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
	created() {
		this.$watch('valueBufferStore', async (val = '') => {
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

	/** @override */
	mounted() {
		this.async.on(this.$el, 'input', {
			label: $$.valueBufferStoreModelInput,
			fn: (e) => {
				this.valueBufferStore = e.target.value || '';
			}
		});
	}
}
