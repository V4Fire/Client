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
	setProps(props: RenderComponentsVnodeParams): Promise<void>;
	dummy: JSHandle<bDummy>;
}
