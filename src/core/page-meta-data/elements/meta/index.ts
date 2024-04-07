/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Engine } from 'core/page-meta-data/elements/abstract';

import type { MetaAttributes } from 'core/page-meta-data/elements/meta/interface';

export * from 'core/page-meta-data/elements/meta/interface';

export class Meta extends AbstractElement<HTMLMetaElement> {
	/** {@link HTMLMetaElement.content} */
	get content(): string {
		return this.attrs.content ?? '';
	}

	/** {@link HTMLMetaElement.content} */
	set content(value: string) {
		this.attrs.content = value;
	}

	/** {@link HTMLMetaElement.name} */
	get name(): string {
		return this.attrs.name ?? '';
	}

	/** {@link HTMLMetaElement.name} */
	set name(value: string) {
		this.attrs.name = value;
	}

	protected override tag!: 'meta';
	protected override attrs!: MetaAttributes;

	constructor(engine: Engine, attrs: MetaAttributes) {
		super(engine, 'meta', attrs);
	}
}
