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

const v4app = require('./dist/ssr/main');

const
	fs = require('node:fs'),
	express = require('express');

const app = express();
const port = 3000;

app.use('/dist', express.static('dist'));

app.get('/', (req, res) => {
	v4app
		.initApp('p-v4-components-demo', {
			location: new URL('https://example.com/user/12345'),

			cookies: v4app.cookies.createCookieStore(''),
			session: v4app.session.from(v4app.kvStorage.asyncSessionStorage)
		})

		.then(({content, styles}) => {
			fs.writeFileSync('./ssr-example.html', content);

			const html = fs.readFileSync('./dist/client/p-v4-components-demo.html', 'utf8');

			res.send(
				html
					.replace(/<!--SSR-->/, content)
					.replace(/<!--STYLES-->/, styles)
			);
		});
});

app.listen(port, () => {
	console.log(`Start: http://localhost:${port}`);
});
