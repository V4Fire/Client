/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @typescript-eslint/no-var-requires, import/first */
import type { LangPacs } from '@v4fire/core/lang';

// eslint-disable-next-line import/no-mutable-exports
let translates: () => LangPacs;

//#if node_js
import htmlTranslates from 'lang/engines/inline-html';

translates = htmlTranslates;
//#endif

//#unless node_js
import inlineTranslates from 'lang/engines/inline';

translates = inlineTranslates;
//#endunless

export default translates;
