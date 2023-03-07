/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LangPacs } from 'lang/interface';

/**
 * Implementation of a keyset collector for a build type when all translations at build time are inserted into html
 */
export default function inlineHtmlEngine(): LangPacs {
	return globalThis[LANG_PACKS];
}
