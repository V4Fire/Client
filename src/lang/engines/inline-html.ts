/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LangPacs } from 'lang/interface';

/**
 * Implementation a keysets collector for the build type when all translations in build time are pasted into html
 */
export function inlineHtmlEngine(): LangPacs {
	return globalThis[TRANSLATES_STORE_PATH];
}
