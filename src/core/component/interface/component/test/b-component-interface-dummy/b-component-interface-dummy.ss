- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< template v-if = stage === 'parent in nested slots'
			< b-dummy v-func = false | -testid = 1
				< b-dummy v-func = false | -testid = 2
					< b-dummy v-func = false | -testid = 3

		< template v-if = stage === 'functional components'
			< b-dummy v-func = false
				< b-list &
					v-func = true |
					:item = 'b-button' |
					:items = [
						{value: 1, label: 1111},
						{value: 2, label: 2222}
					]
				.
