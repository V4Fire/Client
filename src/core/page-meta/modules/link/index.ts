/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LinkAttributes } from 'core/page-meta/modules/link/interface';
import AbstractElement from 'core/page-meta/modules/abstract';

export * from 'core/page-meta/modules/link/interface';


export default class Link extends AbstractElement<HTMLLinkElement> {
	protected override tag!: 'link';
	protected override attrs!: LinkAttributes;

	constructor(attrs: LinkAttributes) {
		super('link', attrs);
	}
}
