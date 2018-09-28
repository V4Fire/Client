- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		{{ foo }}

		< b-input v-once | :value = 'fooo'
		///< b-checkbox
		///< b-textarea
		< b-select :value = '4545' | v-func = false | :options = [ &
			{label: 'foo', value: '1hjh'},
			{label: 'foo', value: '12'},
			{label: 'foo', value: '13yy'},
			{label: 'foo', value: '14f'},
			{label: 'foo', value: '13fy'},
			{label: 'foo', value: '15'},
			{label: 'foo', value: '13'},
			{label: 'foo', value: '1w'},
			{label: 'foo', value: '15dd'},
			{label: 'foo', value: '13f'},
			{label: 'foo', value: '11'},
			{label: 'foo', value: '55555'},
			{label: 'foo', value: '14uu'},
			{label: 'foo', value: '1fdg'},
			{label: 'foo', value: '1gg'},
			{label: 'foo', value: '1fg'},
			{label: 'foo', value: '1d'},
			{label: 'foo', value: '1g'},
			{label: 'foo', value: '1h'},
			{label: 'foo', value: '1j'},
			{label: 'foo', value: '1kd'},
			{label: 'foo', value: '1s'},
			{label: 'foo', value: '1kg'},
			{label: 'foo', value: '1kk'},
			{label: 'foo', value: '1g4'},
			{label: 'foo', value: '16g'},
			{label: 'foo', value: '156'},
			{label: 'foo', value: '14ggg'},
			{label: 'foo', value: '13ttt'},
			{label: 'foo', value: '166'},
			{label: 'foo', value: '19'},
			{label: 'foo', value: '17'},
			{label: 'foo', value: '15ddd'},
			{label: 'foo', value: '14'},
			{label: 'foo', value: '13ll'},
			{label: 'foo', value: '188'},
			{label: 'foo', value: '19ff'},
			{label: '4545', value: '232'},
		] .
