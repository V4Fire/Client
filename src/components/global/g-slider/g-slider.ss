- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */


- include 'components/super/i-block'|b as placeholder
- include 'components/base/b-slider/modules/**/*.ss'|b

- template index(content) extends ['i-block'].index
	- block root
		< .g-slider.&__scroll_direction_horizontal
			{content}

