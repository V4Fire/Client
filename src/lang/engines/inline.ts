/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LangPacs } from 'lang/interface';

/**
 * Implementation of a keyset collector for a build type
 * when all translations at build time are inserted into js source
 */
export default function inlineEngine(): LangPacs {
	return <LangPacs>LANG_KEYSETS;
}
