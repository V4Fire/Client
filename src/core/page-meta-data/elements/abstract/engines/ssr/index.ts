/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Engine } from 'core/page-meta-data/elements/abstract/engines/interface';
import type { AbstractElement } from 'core/page-meta-data/elements';

export class SSREngine implements Engine {
	/** {@link Engine.render} */
	render(_element: AbstractElement, tag: string, attrs: Dictionary<string>): string {
		const attrsString = Object.keys(attrs)
			.map((key) => `${key}="${attrs[key]}"`)
			.join(' ');

		return `<${tag} ${attrsString} />`;
	}

	/** {@link Engine.remove} */
	remove(el: AbstractElement): AbstractElement {
		return el;
	}

	/** {@link Engine.update} */
	update(el: AbstractElement, _attrs: Dictionary<string>): AbstractElement {
		return el;
	}
}

export const ssrEngine = new SSREngine();
