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

require('./dist/ssr/p-v4-components-demo')
	.initApp('p-v4-components-demo', {
		route: '/user/12345',

		globalEnv: {
			ssr: {
				document: {

				}
			},

			location: {
				href: 'https://example.com/user/12345'
			}
		}
	})

	.then((res) => {
		require('fs').writeFileSync('ssr-example.html', res);
	});
