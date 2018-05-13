/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iPage from 'super/i-page/i-page';
import { component, field } from 'super/i-block/i-block';

@component({root: true})
export default class pIndex extends iPage {
	@field()
	foo: number = 0;

	async mounted(): Promise<void> {
		await super.mounted();
		setTimeout(() => {
			this.foo++;
		}, 300);
	}
}
