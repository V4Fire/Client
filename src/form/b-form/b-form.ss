- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		- super
		- block form
			< form.&__form &
				ref = form |
				novalidate |
				:id = id |
				:name = name |
				:action = action |
				@submit.prevent = submit |
				${attrs|!html}
			.
				+= self.slot()
