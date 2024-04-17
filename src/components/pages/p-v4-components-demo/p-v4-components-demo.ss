- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	/// FIXME: временный флаг для тестов
	- renderSSRAsString = true
	- rootTag = 'div'

	- block body
		< .foobaz style = display: block | v-image = {src: 'https://kartin.papik.pro/uploads/posts/2023-07/1688404965_kartin-papik-pro-p-kartinki-leta-v-visokom-kachestve-17.jpg'}

		< b-button
			hello world!
