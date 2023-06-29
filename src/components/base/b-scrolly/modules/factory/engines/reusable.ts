/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';
import type { VNode } from 'components/base/b-scrolly/b-scrolly';

export class ReusableRenderEngine {
	protected vNodesToRender?: VNode[];

	reset(): void {
		// ...
	}

	render(_ctx: bScrolly, _items: ComponentItem[]): HTMLElement[] {
		return Object.cast({});
	}
}
