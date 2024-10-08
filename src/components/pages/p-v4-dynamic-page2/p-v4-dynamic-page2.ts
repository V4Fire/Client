/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/pages/p-v4-dynamic-page2/README.md]]
 * @packageDocumentation
 */

import iDynamicPage, { component } from 'components/super/i-dynamic-page/i-dynamic-page';

export * from 'components/super/i-dynamic-page/i-dynamic-page';

console.log(performance.now(), 'import page2');

@component()
export default class pV4DynamicPage2 extends iDynamicPage {}
