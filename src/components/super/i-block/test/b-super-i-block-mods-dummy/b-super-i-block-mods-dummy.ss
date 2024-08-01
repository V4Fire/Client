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
		< template v-if = stage === 'providing mods using modsProp'
			< b-dummy ref = dummy | :mods = modsToProvide

		< template v-if = stage === 'providing mods using modsProp, provide.mods and attributes'
			< b-checkbox ref = dummy | :checked = checked | :mods = provide.mods(modsToProvide)
