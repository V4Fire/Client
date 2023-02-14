/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */
/* eslint-disable import/first */
import type { LangPacs } from 'lang/interface';

let keysetsCollector: () => LangPacs;

//#if i18nEngine = inlineHtml
import { inlineHtmlEngine } from 'lang/engines/inline-html';

keysetsCollector = inlineHtmlEngine;
//#endif

//#if i18nEngine = default
import { requireContextEngine } from 'lang/engines/require-context';

keysetsCollector = requireContextEngine;
//#endif

export default keysetsCollector;
