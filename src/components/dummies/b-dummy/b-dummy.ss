- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		+= self.slot()

		< b-button @click = spliceItem
			Splice

		< b-button @click = modifyItem
			Modify

		< strong
			Problem
		< ul &
			v-for = (group, groupIndex) in groups |
			:key = groupIndex
		.
			< li
				Group {{groupIndex}}
			< li &
				v-for = item in group |
				:key = item.id
			.
				{{JSON.stringify(item)}}


		< strong
			Debug
		/// Uncomment to fix the bug
		/// < pre
		/// 	{{debug}}
