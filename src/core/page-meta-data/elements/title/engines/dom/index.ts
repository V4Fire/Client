/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { TitleAttributes } from 'core/page-meta-data/elements';
import { DOMEngine } from 'core/page-meta-data/elements/abstract/engines';

export class DOMTitleEngine extends DOMEngine<HTMLTitleElement> {
	override create(_tag: 'title', attrs: TitleAttributes): HTMLTitleElement {
		document.title = attrs.text?.trim() ?? '';
		return document.querySelector('title')!;
	}

	override update(_el: HTMLTitleElement, attrs: TitleAttributes): HTMLTitleElement {
		return this.create('title', attrs);
	}

	override render(_el: HTMLTitleElement): HTMLTitleElement {
		return document.querySelector('title')!;
	}
}

export const domTitleEngine = new DOMTitleEngine();
