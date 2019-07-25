/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if runtime has core/net
//#if runtime has core/net/favicon
export * from 'core/net/engines/favicon';
//#endif
//#endif

//#unless runtime has core/net
// @ts-ignore
export * from 'core/net/engines/loopback';
//#endunless
