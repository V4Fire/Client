/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super from '@v4fire/core/lang';

import { build, locale } from '@config/config';

export * from '@v4fire/core/lang';

let langPacs = {
	...Super
};

if (build.i18nEngine === 'default') {
	// @context: ['src', '@super']

	const
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

} else if (build.i18nEngine === 'inlineHtml') {
	langPacs = {
		...langPacs,
		...globalThis.TRANSLATE_MAP
	};
}

export default langPacs;
