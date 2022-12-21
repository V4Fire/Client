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
		parsedPath = /\/([^/]*?)\.i18n\/(.*?)\.js$/i.exec(path);

	if (parsedPath != null) {
		const
			[_, keysetName, lang] = parsedPath;

		langPacs[lang] = langPacs[lang] ?? {};

		langPacs[lang][keysetName] = ctx(path);
	}
});

// @endcontext

export default langPacs;
