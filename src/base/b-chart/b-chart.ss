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

		- block canvas
			< .&__container v-show = hasData
				< canvas &
					ref = chart |
					:width = width |
					:height = height
				.

		- block emptyState
			< .&__empty v-if = !hasData
				{{ `No data to display` }}
