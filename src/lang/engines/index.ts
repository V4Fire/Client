/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// eslint-disable-next-line import/no-mutable-exports
let translates;

//#if node_js
translates = require('lang/engines/inline').default;
//#endif

//#unless node_js
translates = require('lang/engines/inline-html').default;
//#endunless

export default translates;
