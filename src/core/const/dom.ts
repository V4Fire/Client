/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

//#if node_js
import { JSDOM } from 'jsdom';

const jsdom = new JSDOM();
//#endif

export default SSR ? jsdom : globalThis;
