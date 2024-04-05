/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MockDictionary } from 'core/data';

export default <MockDictionary>{
	GET: [
		{
			query: {id: 1},
			response: {
				id: 1,
				name: 'Monthy Python'
			}
		},
		{
			query: {id: 2},
			response: {
				id: 2,
				name: '300'
			}
		}
	]
};
