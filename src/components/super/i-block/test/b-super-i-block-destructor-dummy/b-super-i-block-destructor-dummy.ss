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
		< template v-if = content
			< . v-async-target
				< template v-for = el in asyncRender.iterate(2, 1)
					< b-button v-func = false | @hook:mounted = pushToStore | ref = child
						Button

					< b-button @hook:mounted = pushToStore
						< b-checkbox @hook:mounted = pushToStore
						< b-checkbox v-func = false | @hook:mounted = pushToStore
