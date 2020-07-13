/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-dynamic-page/README.md]]
 * @packageDocumentation
 */

import iPage, { component } from 'super/i-page/i-page';
export * from 'super/i-page/i-page';

@component()
export default abstract class iDynamicPage extends iPage {}
