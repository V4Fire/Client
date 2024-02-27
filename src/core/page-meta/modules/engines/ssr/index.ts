/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export default class SSREngine {
	create(tag: string, attrs: Dictionary<string>): string {
		const attrsString = Object.keys(attrs)
			.map((key) => `${key}="${attrs[key]}"`)
			.join(' ');

		return `<${tag} ${attrsString} />`;
	}

	remove() {
		// Loopback
	}

	update() {
		// Loopback
	}

	find() {
		// Loopback
	}
}
