- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		< b-select &
			ref = select |
			v-func = true |
			:value = selectValue |
			:items = [
				{value: '1', label: '001'},
				{value: '2', label: '002'}
			] |
			:native = true |
			:form = false |
			@onChange = onSelectChange
		.


		< b-input &
			v-func = false |
			:value = someField |
			@onChange = onInputChange
		.
