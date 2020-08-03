/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ImageLoader } from 'core/component/directives/image';
import { InViewAdapter } from 'core/component/directives/in-view';

export interface Directives {
	image: typeof ImageLoader;
	inViewMutation: InViewAdapter;
	inViewObserver: InViewAdapter;
}
