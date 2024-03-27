/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MetaAttributes } from 'core/page-meta-data/elements/meta/interface';
import type { Engine } from 'core/page-meta-data/elements/abstract/engines';
import { AbstractElement } from 'core/page-meta-data/elements/abstract';

export * from 'core/page-meta-data/elements/meta/interface';

export class Meta extends AbstractElement<HTMLMetaElement> {
	/** {@link HTMLMetaElement.content} */
	get content(): string {
		return this.attrs.content ?? '';
	}

	set content(value: string) {
		this.attrs.content = value;
	}

	/** {@link HTMLMetaElement.name} */
	get name(): string {
		return this.attrs.name ?? '';
	}

	set name(value: string) {
		this.attrs.name = value;
	}

	protected override tag!: 'meta';
	protected override attrs!: MetaAttributes;

	constructor(engine: Engine, attrs: MetaAttributes) {
		super(engine, 'meta', attrs);
	}
}
