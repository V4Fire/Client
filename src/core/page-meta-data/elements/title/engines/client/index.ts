/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TitleAttributes } from 'core/page-meta-data/elements';
import { CSREngine } from 'core/page-meta-data/elements/abstract/engines';

export default class CSRTitleEngine extends CSREngine<HTMLTitleElement> {
	override create(_tag: 'title', attrs: TitleAttributes): HTMLTitleElement {
		document.title = attrs.text?.trim() ?? '';
		return document.querySelector('title')!;
	}

	override update(_el: HTMLTitleElement, attrs: TitleAttributes): HTMLTitleElement {
		return this.create('title', attrs);
	}
}
