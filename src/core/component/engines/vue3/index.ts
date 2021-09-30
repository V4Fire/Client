/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/engines/vue3/README.md]]
 * @packageDocumentation
 */

import Vue from 'core/component/engines/vue3/lib';
import 'core/component/engines/vue3/config';

export * from 'vue';

/** @deprecated */
export { Vue as ComponentDriver };
export { Vue as ComponentEngine };
export { Vue as default };

export * from 'core/component/engines/vue3/const';
export * from 'core/component/engines/vue3/vnode';
export * from 'core/component/engines/vue3/component';

//#if VueInterfaces
export { VNode } from 'vue';
//#endif
