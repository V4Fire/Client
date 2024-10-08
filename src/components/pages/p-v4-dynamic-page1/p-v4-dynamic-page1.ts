/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-dynamic-page1/README.md]]
 * @packageDocumentation
 */

import iDynamicPage, { component } from 'components/super/i-dynamic-page/i-dynamic-page';

export * from 'components/super/i-dynamic-page/i-dynamic-page';

console.log(performance.now(), 'import page1');

@component()
export default class pV4DynamicPage1 extends iDynamicPage {}
