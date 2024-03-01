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

const app = require('./dist/ssr/p-v4-components-demo');

app
	.initApp('p-v4-components-demo', {
		location: new URL('https://example.com/user/12345'),

		cookies: app.cookies.createCookieStore(''),
		session: app.session.from(app.kvStorage.asyncSessionStorage)
	})

	.then(({content, styles}) => {
		require('node:fs').writeFileSync('ssr-example.html', `<style>${styles}</style>${content}`);
	});

