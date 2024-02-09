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
		< b-button @click = activeTab += 1
			ActiveTab: {{activeTab}}

		< b-form @onSubmitStart = console.log('onSubmit')
			< b-button :type = 'submit'
					Submit
