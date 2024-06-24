- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/dummies/b-dummy'|b as placeholder

- template index() extends ['b-dummy'].index
	- block body
		< p
			Counter: {{counter}}

		< template v-if = stage === 'main'
			< b-functional-button-dummy ref = button | @click:component = onClick

