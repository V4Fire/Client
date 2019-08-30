- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- rootWrapper = false

		- block rootAttrs
  		? Object.assign(rootAttrs, {':style': 'size'})

	- block body
		- super

		< svg.&__svg :viewBox.camel = this.viewBoxAttr
			< circle.&__track &
				:style = {color: trackColor} |
				:strokeWidth = strokeWidth |
				:strokeDashoffset = 0 |
				:fill = 'transparent' |
				:stroke = 'currentColor' |
				:cx = this.viewBox |
				:cy = this.viewBox |
				:r = radius |
				:strokeDasharray = 314.159
			.

			< circle.&__circle &
				:style = {color: color} |
				:strokeWidth = strokeWidth |
				:strokeDashoffset = strokeDashOffset |
				:fill = 'transparent' |
				:stroke = 'currentColor' |
				:cx = this.viewBox |
				:cy = this.viewBox |
				:r = radius |
				:strokeDasharray = 314.159
			.

		< .&__text &
			v-if = showValue |
			:style = {fontSize: fontSize}
		.
			{{ value }}

