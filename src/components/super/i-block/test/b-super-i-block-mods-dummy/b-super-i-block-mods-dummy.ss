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

		< template v-if = stage === 'passing mods as undefined'
			< b-checkbox ref = dummy | :size = undefined | v-attrs = {checked: undefined}

		< template v-if = stage === 'updating. providing mods as separate attributes'
			< b-checkbox v-func = false | ref = dummy | :checked = checked

		< template v-if = stage === 'updating. providing mods by v-attrs'
			< b-checkbox v-func = false | ref = dummy | :v-attrs = {checked}

		< template v-if = stage === 'updating. providing mods using modsProp'
			< b-checkbox v-func = false | ref = dummy | :mods = {checked}

		< template v-if = stage === 'updating. providing mods using modsProp by v-attrs'
			< b-checkbox v-func = false | ref = dummy | :v-attrs = {'@:mods': createPropAccessors(() => ({checked}))}
