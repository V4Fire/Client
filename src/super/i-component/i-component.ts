/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { component, field, prop, p } from 'core/component';

@component({inject: {foo: {from: 'bla'}}})
export default class iComponent {
	@field(<iComponent>(o) => o.baz)
	bla: string;

	static mods = {
		disabled: [
			[true],
			false
		]
	};

	get bad() {

	}

	@p({watch: ['bla']})
	baz() {

	}
}

@component({inject: ['ff2']})
export class iComponent2 extends iComponent {
	model = '';

	@prop({watch: ['foo24']})
	bla: string = '12121';

	@prop({watch: ['foo24']})
	bla2: string = '454545';
}
