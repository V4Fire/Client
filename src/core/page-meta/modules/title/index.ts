/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TitleAttributes } from 'core/page-meta/modules/title/interface';
import AbstractElement from 'core/page-meta/modules/abstract';

export * from 'core/page-meta/modules/title/interface';


export default class Title extends AbstractElement<HTMLTitleElement> {
	protected override tag!: 'title';
	protected override attrs!: TitleAttributes;

	constructor(attrs: TitleAttributes) {
		super('title', attrs);
	}

	override create(): string | HTMLTitleElement {
		if (SSR) {
			return super.create();
		}

		const
			div = Object.assign(globalThis.document.createElement('div'), {innerHTML: this.attrs.text}),
			title = div.textContent ?? '';

		// Fix for a strange Chrome bug
		globalThis.document.title = `${title} `;
		globalThis.document.title = title;

		return globalThis.document.querySelector('title')!;
	}
}
