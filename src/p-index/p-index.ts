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
export class iBla extends iStaticPage {
	@field()
	foo: number;
}

@component({root: true})
export default class pIndex extends iBla {
	get foo(): number {
		return 1;
	}

	async mounted(): Promise<void> {
		console.log(222, this.foo);

		await super.mounted();
		setTimeout(() => {
			this.foo++;
		}, 300);
	}
}
