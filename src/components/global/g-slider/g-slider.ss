- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */


- include 'components/super/i-block'|b as placeholder

- template index(content) extends ['i-block'].index
	- block root
		< .g-slider.&__horizontal_true
			{content}

