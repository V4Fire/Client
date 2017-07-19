- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-select'|b as placeholder

- template index() extends ['b-select'].index
	- blockName = 'b-select'

	- block rootAttrs
		- super
		? Object.assign(rootAttrs, {':class': 'rootClasses'})

	- block attrs
		? attrs = {}

	- block input
		< _.&__cell.&__input-cont
			< input.&__input &
				:id = id |
				:type = type |
				:value = value |
				:placeholder = placeholder && t(placeholder) |
				:autocomplete = autocomplete |
				:autofocus = autofocus |
				${attrs|!html}
			.

	- block clear
	- block dropdown
