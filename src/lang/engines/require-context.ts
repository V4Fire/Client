/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { LangPacs } from 'lang/interface';

import config from 'config';

/**
 * Implementation a keysets collector based on require.context
 * @see https://webpack.js.org/guides/dependency-management/#requirecontext
 */
export function requireContextEngine(): LangPacs {
	// @context: ['src', '@super']

	const
		langPacs = {},
		regExp = new RegExp(`.i18n/${config.locale}.js$`),
		// @ts-ignore (require)
		ctx = require.context('src', true, regExp);

	ctx.keys().forEach((path: string) => {
		const
			parsedPath = /\/[^/]*?\.i18n\/(.*?)\.js$/i.exec(path);

		if (parsedPath != null) {
			const
				[_, lang] = parsedPath;

			langPacs[lang] = langPacs[lang] ?? {};

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
