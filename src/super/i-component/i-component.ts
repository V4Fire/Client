/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import '@v4fire/core/core';
import { component, field, prop, p, system, PARENT } from 'core/component';

console.log(333);

@component()
export default class iComponent implements Vue {
	static mods: Dictionary = {
		disabled: [
			[true],
			false
		]
	};

	@system()
	banan: number[] = [1, 2, 3];

	@prop({type: String})
	bla2!: string;

	@field(<iComponent>(o) => o.baz)
	bla: string = '34534';

	get bad() {

	}

	@p({watch: 'bla', hook: {created: 'init'}})
	baz() {
		console.log(22);
	}

	@p({hook: 'created'})
	init() {
		console.log(1212);
	}

	render(el) {
		return el('span', '121');
	}
}

@component()
export class iComponent2 extends iComponent {
	static mods: Dictionary = {
		disabled: null
	};

	model = '';

	@prop({watch: ['foo24']})
	bla: string = '12121';

	@prop({watch: ['foo24']})
	bla2: string = '454545';

	@p({hook: 'mounted'})
	init() {

	}
}

document.addEventListener('DOMContentLoaded', () => {
	new Vue({
		data: {},
		el: document.getElementById('bla'),
		render(el) {
			return el('i-component');
		}
	})
});
