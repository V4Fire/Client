/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type { JSHandle } from 'playwright';

/**
 * Handle component interface that was created with a dummy wrapper.
 */
export interface ComponentInDummy<T> extends JSHandle<T> {
	/**
	 * Updates props and children of a component
	 *
	 * @param params
	 * @param [mixInitialProps] - if true, then the props will not be overwritten, but added to the current ones
	 */
	update(params: RenderComponentsVnodeParams, mixInitialProps?: boolean): Promise<void>;

	dummy: JSHandle<bDummy>;
}
