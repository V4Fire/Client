'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js');

export default {
	/**
	 * Returns true if the specified key code relates to a numeric key
	 * @param keyCode
	 */
	isNumber(keyCode: number): boolean {
		return keyCode >= this.ZERO && keyCode <= this.NINE;
	},

	/**
	 * Returns true if the specified key code relates to a letter key
	 * @param keyCode
	 */
	isLetter(keyCode: number): boolean {
		return keyCode >= this.A && keyCode <= this.Z;
	},

	/**
	 * Returns true if the specified key code relates to a navigation key
	 * @param keyCode
	 */
	isNavigation(keyCode: number): boolean {
		return keyCode >= this.LEFT && keyCode <= this.DOWN;
	},

	/**
	 * Returns true if the specified key code relates to a whitespace key
	 * @param keyCode
	 */
	isWhitespace(keyCode: number): boolean {
		return keyCode === this.SPACE || keyCode === this.ENTER || keyCode === this.TAB;
	},

	/**
	 * Returns true if the specified key code relates to a F1-12 key
	 * @param keyCode
	 */
	isF1ToF12(keyCode: number): boolean {
		return keyCode >= this.F1 && keyCode <= this.F12;
	},

	/**
	 * Returns the string value of the specified key code
	 * @param keyCode
	 */
	keyCodeToString(keyCode: number): ?string {
		if (this.isLetter(keyCode) || this.isNumber(keyCode)) {
			return String.fromCharCode(keyCode);
		}

		return this.getKeyNameFromKeyCode(keyCode);
	},

	/**
	 * Returns the name of the specified key code
	 * @param keyCode
	 */
	getKeyNameFromKeyCode(keyCode: number): ?string {
		return $C(this).one.get((el) => el === keyCode) || null;
	},

	// Hacks
	ANDROID_229: 229,

	// Control
	ENTER: 13,
	ESC: 27,
	BACKSPACE: 8,
	TAB: 9,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	SPACE: 32,

	// Meta
	PAUSE: 19,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,

	// Arrows
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,

	// Editing
	INSERT: 45,
	DELETE: 46,

	// F1-12
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,

	// Numpad
	DOT: 190,
	DOT_NUMPAD: 110,
	COMA: 188,
	COMA_NUMPAD: 0,

	// Letters
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,

	// Numbers
	ZERO: 48,
	ONE: 49,
	TWO: 50,
	THREE: 51,
	FOUR: 52,
	FIVE: 53,
	SIX: 54,
	SEVEN: 55,
	EIGHT: 56,
	NINE: 57
};
