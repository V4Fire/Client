/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/engines/zero/README.md]]
 * @packageDocumentation
 */

import minimalCtx from 'core/component/engines/zero/context';
import type { VNodeData } from 'core/component/engines/zero/interface';

//#if VueInterfaces
export * from 'vue';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export * from 'core/component/engines/zero/const';
export * from 'core/component/engines/zero/engine';
export * from 'core/component/engines/zero/component';
export * from 'core/component/engines/zero/vnode';
export * from 'core/component/engines/zero/interface';

export {

	ComponentEngine as default,
	ComponentEngine as ComponentDriver

} from 'core/component/engines/zero/engine';

export { minimalCtx, VNodeData };
