/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Sugar for CSS
 */
Object.defineProperties(Number.prototype, /** @lends {Number.prototype} */ {
	em: {
		get(): string {
			return `${this}em`;
		}
	},

	ex: {
		get(): string {
			return `${this}ex`;
		}
	},

	px: {
		get(): string {
			return `${this}px`;
		}
	},

	per: {
		get(): string {
			return `${this}%`;
		}
	},

	rem: {
		get(): string {
			return `${this}rem`;
		}
	}
});
