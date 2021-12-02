/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:pages/p-v4-dynamic-page3/README.md]]
 * @packageDocumentation
 */

import iDynamicPage, { component } from '@src/super/i-dynamic-page/i-dynamic-page';

export * from '@src/super/i-dynamic-page/i-dynamic-page';

/**
 * Simple dynamic page for tests
 */
@component()
export default class pV4DynamicPage3 extends iDynamicPage {}
