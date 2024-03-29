/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime.engine = vue
export * from 'core/component/engines/vue';
//#endif

//#if runtime.engine = zero
// @ts-ignore (double export)
export * from 'core/component/engines/zero';
//#endif

export * from 'core/component/engines/interface';
export { VNode } from 'core/component/engines/interface';
