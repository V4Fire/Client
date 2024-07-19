/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Engine } from 'core/page-meta-data/elements/abstract';

import type { TitleAttributes } from 'core/page-meta-data/elements/title/interface';

export * from 'core/page-meta-data/elements/title/interface';
export * from 'core/page-meta-data/elements/title/engines';

export class Title extends AbstractElement<HTMLTitleElement> {
	/** {@link HTMLTitleElement.text} */
	get text(): string {
		return this.attrs.text ?? '';
	}

	/** {@link HTMLTitleElement.text} */
	set text(value: string) {
		this.attrs.text = value;
	}

	protected override tag!: 'title';
	protected override attrs!: TitleAttributes;

	constructor(engine: Engine, attrs: TitleAttributes) {
		super(engine, 'title', attrs);
	}
}
