/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import bInput from 'form/b-input/b-input';

export const
	$$ = symbolGenerator();

/**
 * Handler: mask focus
 *
 * @param component
 * @param e
 */
export async function onMaskFocus<T extends bInput<any, any, any>>(component: T, e: FocusEvent): Promise<void> {
	const
		c = component;

	if (c.mods.empty === 'true') {
		await c.applyMaskToValue('', {updateBuffer: true});
	}

	const
		// @ts-ignore
		m = c._mask;

	if (!m) {
		return;
	}

	let
		pos = 0;

	for (let o = m.value, i = 0; i < o.length; i++) {
		if (Object.isRegExp(o[i])) {
			pos = i;
			break;
		}
	}

	// @ts-ignore
	c.$refs.input.setSelectionRange(pos, pos);
}

/**
 * Handler: mask blur
 *
 * @param component
 * @param e
 */
export function onMaskBlur<T extends bInput<any, any, any>>(component: T, e: Event): void {
	const
		// @ts-ignore
		m = component._mask;

	if (!m) {
		return;
	}

	// @ts-ignore
	if (component.valueBuffer === m.tpl) {
		component.value = '';
	}
}

/**
 * Handler: mask cursor position save
 *
 * @param component
 * @param e
 */
export function onMaskCursorReady<T extends bInput<any, any, any>>(component: T, e: KeyboardEvent | MouseEvent): void {
	const
		// @ts-ignore
		{input} = component.$refs;

	if (!input) {
		return;
	}

	// @ts-ignore
	component._lastMaskSelectionStartIndex = input.selectionStart;
	// @ts-ignore
	component._lastMaskSelectionEndIndex = input.selectionEnd;
}

/**
 * Handler: mask value save
 *
 * @param component
 * @param e
 */
export function onMaskValueReady<T extends bInput<any, any, any>>(component: T, e: KeyboardEvent | MouseEvent): void {
	// @ts-ignore
	component._maskBuffer = component.valueBuffer;
}

/**
 * Handler: mask input
 *
 * @param component
 * @emits actionChange(value: V)
 */
export async function onMaskInput<T extends bInput<any, any, any>>(component: T): Promise<void> {
	const
		c = component;

	await c.applyMaskToValue(undefined, {
		// @ts-ignore
		start: c._lastMaskSelectionStartIndex,
		// @ts-ignore
		end: c._lastMaskSelectionEndIndex
	});

	// @ts-ignore
	c.onRawDataChange(c.value);
}

/**
 * Handler: backspace for the mask
 *
 * @param component
 * @param e
 * @emits actionChange(value: V)
 */
export async function onMaskBackspace<T extends bInput<any, any, any>>(component: T, e: KeyboardEvent): Promise<void> {
	const codes = {
		Backspace: true,
		Delete: true
	};

	if (!codes[e.key]) {
		return;
	}

	e.preventDefault();

	const
		c = component,
		// @ts-ignore
		{input} = c.$refs;

	if (!input) {
		return;
	}

	const
		selectionStart = input.selectionStart || 0,
		selectionEnd = input.selectionEnd || 0,
		selectionFalse = selectionStart === selectionEnd;

	const
		// @ts-ignore
		m = c._mask,
		mask = m && m.value,
		ph = c.maskPlaceholder;

	if (!m || !mask) {
		return;
	}

	let
		// @ts-ignore
		res = c.valueBuffer,
		pos = 0;

	if (e.key === 'Delete') {
		let
			start = selectionStart,
			end = selectionEnd;

		const
			chunks = <string[]>[];

		for (let i = 0; i < mask.length; i++) {
			const
				el = mask[i];

			if (res && Object.isRegExp(el) && el.test(res[i])) {
				chunks.push(res[i]);

			} else {
				if (i < selectionStart) {
					start--;
				}

				if (!selectionFalse && i < selectionEnd) {
					end--;
				}
			}
		}

		chunks.splice(start, selectionFalse ? 1 : end - start);
		res = chunks.join('');

		if (res) {
			await c.applyMaskToValue(res, {cursor: selectionStart, maskBuffer: ''});

		} else {
			// @ts-ignore
			c.skipBuffer = true;
			c.value = '';
			await c.applyMaskToValue('', {updateBuffer: true});
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
		// @ts-ignore
		c.skipBuffer = true;
		c.value = '';
		await c.applyMaskToValue('', {updateBuffer: true});

	} else {
		c.value = input.value = res;
		input.setSelectionRange(start, start);
	}

	// @ts-ignore
	c.onRawDataChange(c.value);
}

/**
 * Handler: mask navigation by arrows
 *
 * @param component
 * @param e
 */
export function onMaskNavigate<T extends bInput<any, any, any>>(component: T, e: KeyboardEvent | MouseEvent): void {
	if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey) {
		return;
	}

	const
		c = component,
		keyboardEvent = e instanceof KeyboardEvent,
		leftKey = (<KeyboardEvent>e).key === 'ArrowLeft';

	if (keyboardEvent ? !leftKey && (<KeyboardEvent>e).key !== 'ArrowRight' : (<MouseEvent>e).button !== 0) {
		return;
	}

	const event = () => {
		const
			// @ts-ignore
			m = c._mask;

		if (!m) {
			return;
		}

		const
			mask = m.value,
			// @ts-ignore
			{input} = c.$refs;

		if (!input) {
			return;
		}

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
				for (let i = 0; i < mask.length; i++) {
					if (Object.isRegExp(mask[i])) {
						pos = i;
						break;
					}
				}
			}

			input.setSelectionRange(pos, pos);
		}
	};

	if (keyboardEvent || c.mods.focused !== 'true') {
		e.preventDefault();
		keyboardEvent && event();

	} else {
		// @ts-ignore
		c.async.setImmediate(event, {label: $$.setCursor});
	}
}

/**
 * Handler: mask input from a keyboard
 *
 * @param component
 * @param e
 * @emits actionChange(value: V)
 */
export function onMaskKeyPress<T extends bInput<any, any, any>>(component: T, e: KeyboardEvent): void {
	const
		c = component;

	const blacklist = {
		Tab: true
	};

	const
		// @ts-ignore
		{valueBuffer, _mask} = c;

	if (e.altKey || e.shiftKey || e.ctrlKey || e.metaKey || blacklist[e.key] || !valueBuffer || !_mask) {
		return;
	}

	e.preventDefault();

	const
		// @ts-ignore
		{input} = c.$refs;

	if (!input) {
		return;
	}

	const
		selectionStart = input.selectionStart || 0,
		selectionEnd = input.selectionEnd || 0;

	const
		res = valueBuffer.split(''),
		mask = _mask.value;

	let
		insert = true,
		n = selectionEnd - selectionStart + 1,
		start = selectionStart,
		inputVal = e.key;

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
				inputVal = c.maskPlaceholder;
			}
		}
	}

	while (start < mask.length && !Object.isRegExp(mask[start])) {
		start++;
	}

	c.value = input.value = res.join('');
	input.setSelectionRange(start, start);

	// @ts-ignore
	c.onRawDataChange(c.value);

	if (c.isMaskInfinite === true && selectionEnd + 1 === mask.length) {
		c.updateMask(true);
		input.setSelectionRange(start + 1, start + 1);
	}
}
