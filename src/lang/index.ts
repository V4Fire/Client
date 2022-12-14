import Super from '@v4fire/core/lang';

export * from '@v4fire/core/lang';

const langPacs = {
	...Super
};

const
	// @ts-ignore (require)
	ctx = require.context('src', true, /i18n\/.*\.js$/);

ctx.keys().forEach((path: string) => {
	const
		result = /\/([^/]*?)\.i18n\/(.*?)\.js$/i.exec(path);

	if (result != null) {
		const
			[_, keysetName, lang] = result;

		langPacs[lang] = langPacs[lang] ?? {};

		langPacs[lang][keysetName] = ctx(path);
	}
});

export default langPacs;
