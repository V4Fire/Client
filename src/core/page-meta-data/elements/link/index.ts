/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LinkAttributes } from 'core/page-meta-data/elements/link/interface';
import type { Engine } from 'core/page-meta-data/elements/abstract/engines';
import { AbstractElement } from 'core/page-meta-data/elements/abstract';

export * from 'core/page-meta-data/elements/link/interface';

/**
 * Link element
 */
export class Link extends AbstractElement<HTMLLinkElement> {
	/** {@link HTMLLinkElement.rel} */
	get rel(): string {
		return this.attrs.rel ?? '';
	}

	set rel(value: string) {
		this.attrs.rel = value;
	}

	/** {@link HTMLLinkElement.href} */
	get href(): string {
		return this.attrs.href ?? '';
	}

	set href(value: string) {
		this.attrs.href = value;
	}

	/** {@link HTMLLinkElement.type} */
	get type(): string {
		return this.attrs.type ?? '';
	}

	set type(value: string) {
		this.attrs.type = value;
	}

	protected override tag!: 'link';
	protected override attrs!: LinkAttributes;

	constructor(engine: Engine, attrs: LinkAttributes) {
		super(engine, 'link', attrs);
	}
}
