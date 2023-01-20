/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super from '@v4fire/core/lang';

export * from '@v4fire/core/lang';

const langPacs = {
	...Super
};

// @context: ['src', '@super']

const
	// @ts-ignore (require)
	ctx = require.context('src', true, /i18n\/.*\.js$/);

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

export default langPacs;
