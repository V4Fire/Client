- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__dummy-name
			{{ dummyData.username }}

		< .&__dummy-email
			{{ dummyData.email }}

		< .&__dummy-password
			{{ dummyData.password }}

		< .&__dummy-test-val
			{{ dummyTestVal }}