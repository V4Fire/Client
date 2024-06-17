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
		< .
			< template v-if = stage === 'with effect'
				< b-effect-prop-dummy :data = someField

			< template v-if = stage === 'without effect'
				< b-non-effect-prop-dummy :data = someField
