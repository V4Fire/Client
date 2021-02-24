/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/engines/vue/README.md]]
 * @packageDocumentation
 */

import Vue from 'vue';
import 'core/component/engines/vue/config';

export * from 'vue';

/** @deprecated */
export { Vue as ComponentDriver };
export { Vue as ComponentEngine };
export { Vue as default };

export * from 'core/component/engines/vue/const';
export * from 'core/component/engines/vue/vnode';
export * from 'core/component/engines/vue/render';
export * from 'core/component/engines/vue/component';

//#if VueInterfaces
export { VNode, ScopedSlot, NormalizedScopedSlot } from 'vue/types/vnode';
//#endif
