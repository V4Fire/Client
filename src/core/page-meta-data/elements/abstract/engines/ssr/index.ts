/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines/interface';
import type PageMetaData from 'core/page-meta-data';
import type { AbstractElement } from 'core/page-meta-data/elements';

export default class SSREngine implements Engine {
	// protected elementsStore: PageMeta['elements'];
	//
	// constructor(elements: PageMeta['elements']) {
	// 	this.elementsStore = elements;
	// }

	// create(tag: string, attrs: Dictionary<string>): AbstractElement {
	// 	return ctx;
	// }

	render(_element: AbstractElement, tag: string, attrs: Dictionary<string>): string {
		const attrsString = Object.keys(attrs)
			.map((key) => `${key}="${attrs[key]}"`)
			.join(' ');

		return `<${tag} ${attrsString} />`;
	}

	update(el: AbstractElement, attrs: Dictionary<string>): AbstractElement {
		return Object.assign(el, {attrs});
	}
}
