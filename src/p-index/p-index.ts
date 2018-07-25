/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iStaticPage from 'super/i-static-page/i-static-page';
import { component, field } from 'super/i-block/i-block';

@component({root: true})
export default class pIndex extends iStaticPage {
	@field()
	foo: number = 0;

	async mounted(): Promise<void> {
		await super.mounted();
		setTimeout(() => {
			this.foo++;
		}, 300);
	}
}
