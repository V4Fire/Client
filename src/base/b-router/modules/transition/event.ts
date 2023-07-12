/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export class LinkNavigateEvent<T extends Element = Element> extends CustomEvent<{href: string; target: T}> {
	constructor(target: T) {
		super('linkNavigate', {
			cancelable: true,
			detail: {
				href: target.getAttribute('href') ?? '',
				target
			}
		});
	}
}
