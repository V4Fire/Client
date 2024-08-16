/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Engine } from 'core/page-meta-data/elements/abstract';

import type { LinkAttributes } from 'core/page-meta-data/elements/link/interface';

export * from 'core/page-meta-data/elements/link/interface';

export class Link extends AbstractElement<HTMLLinkElement> {
	/** {@link HTMLLinkElement.rel} */
	get rel(): string {
		return this.attrs.rel ?? '';
	}

	/** {@link HTMLLinkElement.rel} */
	set rel(value: string) {
		this.attrs.rel = value;
	}

	/** {@link HTMLLinkElement.href} */
	get href(): string {
		return this.attrs.href ?? '';
	}

	/** {@link HTMLLinkElement.href} */
	set href(value: string) {
		this.attrs.href = value;
	}

	/** {@link HTMLLinkElement.type} */
	get type(): string {
		return this.attrs.type ?? '';
	}

	/** {@link HTMLLinkElement.type} */
	set type(value: string) {
		this.attrs.type = value;
	}

	/** @inheritDoc */
	declare protected tag: 'link';

	/** @inheritDoc */
	declare protected attrs: LinkAttributes;

	constructor(engine: Engine, attrs: LinkAttributes) {
		super(engine, 'link', attrs);
	}
}
