/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/*
 To ensure proper SSR functionality, two builds are required:

 1. Server build:

   ```bash
   npx webpack --env ssr=true --env client-output=ssr
   ```

 2. Client build:

   ```bash
   npx webpack --env hydration=true
   ```
*/

require('./dist/ssr/std');

const v4app = require('./dist/ssr/p-v4-components-demo');

const express = require('express');

const app = express();
const port = 3000;

console.log(v4app.CookiesEngine);

app.get('/', (req, res) => {
	v4app
		.initApp('p-v4-components-demo', {
			location: new URL('https://example.com/user/12345'),

			cookies: v4app.cookies.createCookieStore(''),
			session: v4app.session.from(v4app.kvStorage.asyncSessionStorage),
			theme: v4app.themeManager.default({
				themeStorageEngine: v4app.CookiesEngine.syncLocalStorage,
				systemThemeExtractor: new v4app.themeManager.SystemThemeExtractorSsr(req.headers)
			})
		})

		.then(({content, styles}) => {
			res.send(`<style>${styles}</style>${content}`);
		});
});

app.listen(port, () => {
	console.log(`Start: http://localhost:${port}`);
});
