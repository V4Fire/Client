/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LangPacs } from 'lang/interface';

/**
 * Implementation a keysets collector based on require.context
 * @see https://webpack.js.org/guides/dependency-management/#requirecontext
 */
export function requireContextEngine(): LangPacs {
	const langPacs = {};

	// @context: ['src', '@super']
	// @ts-ignore (require)
	const ctx = require.context('src', true, /\.i18n\/.*\.js$/);

	ctx.keys().forEach((path: string) => {
		const
			parsedPath = /\/[^/]*?\.i18n\/(.*?)\.js$/i.exec(path);

		if (parsedPath != null) {
			const [_, lang] = parsedPath;
			langPacs[lang] ??= {};

			Object.keys(ctx(path)).forEach((keysetName) => {
				langPacs[lang][keysetName] = {
					...ctx(path)[keysetName]
				};
			});
		}
	});
	// @endcontext

	return langPacs;
}
