/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { build, locale } from '@config/config';

import type { LangPacs } from 'lang/interface';

/**
 * Implementation a keysets collector based on require.context
 * @see https://webpack.js.org/guides/dependency-management/#requirecontext
 */
export function requireContextEngine(): LangPacs {
	// @context: ['src', '@super']

	const
		langPacs = {},
		regExp = build.multiLanguage === true ? /\.i18n\/.*\.js$/ : new RegExp(`.i18n/${locale}.js$`),
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
					...langPacs[lang][keysetName] != null ? langPacs[lang][keysetName] : {},
					...ctx(path)[keysetName]
				};
			});
		}
	});

	// @endcontext

	return langPacs;
}
