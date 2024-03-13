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


export class Link extends AbstractElement<HTMLLinkElement> {
	protected override tag!: 'link';
	// protected override attrs!: LinkAttributes;

	constructor(engine: Engine<HTMLLinkElement>, attrs: LinkAttributes) {
		super(engine, 'link', attrs);
	}
}
