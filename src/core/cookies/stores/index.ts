/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if node_js
export * from 'core/cookies/stores/node';
//#endif

//#unless node_js
// @ts-ignore (reexport)
export * from 'core/cookies/stores/browser';
//#endunless

export * from 'core/cookies/stores/const';
export * from 'core/cookies/stores/ssr-store-decorator';
