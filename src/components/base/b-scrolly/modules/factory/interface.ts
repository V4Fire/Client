/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';

export interface RenderEngine {
	reset(): void;
	render(ctx: bScrolly, items: ComponentItem[]): HTMLElement[];
}
