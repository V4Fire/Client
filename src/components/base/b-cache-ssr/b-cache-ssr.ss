- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block innerRoot
		< template v-if = $ssrCache[cacheKey] != null
			< _ v-html = $ssrCache[cacheKey]

		< template v-else
			< _
				+= self.slot()
