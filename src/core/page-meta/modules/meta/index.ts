/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MetaAttributes } from 'core/page-meta/modules/meta/interface';
import AbstractElement from 'core/page-meta/modules/abstract';

export * from 'core/page-meta/modules/meta/interface';

export default class Meta extends AbstractElement<HTMLMetaElement> {
	protected override tag!: 'meta';
	protected override attrs!: MetaAttributes;

	constructor(attrs: MetaAttributes) {
		super('meta', attrs);
	}
}
