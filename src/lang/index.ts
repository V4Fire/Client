/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Super from '@v4fire/core/lang';

import keysetsCollector from 'lang/engines';

export * from '@v4fire/core/lang';

const langPacs = {
	...Super
};

try {
	Object.entries(keysetsCollector()).forEach(([lang, keysets]) => {
		Object.entries(keysets).forEach(([keysetName, keyset]) => {
			langPacs[lang] = langPacs[lang] ?? {};
			langPacs[lang][keysetName] = {
				...langPacs[lang][keysetName],
				...keyset
			};
		});
	});

} catch {}

export default langPacs;
