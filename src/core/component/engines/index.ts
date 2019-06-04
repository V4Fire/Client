/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#unless runtime has zero
export * from 'core/component/engines/vue';
//#endunless

//#if runtime has zero
// @ts-ignore
export * from 'core/component/engines/zero';
//#endif
