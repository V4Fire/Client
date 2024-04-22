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
		< .foobaz &
			v-image = {
				src: 'https://kartin.papik.pro/uploads/posts/2023-07/1688404965_kartin-papik-pro-p-kartinki-leta-v-visokom-kachestve-17.jpg',
				preview: 'https://kartin.papik.pro/uploads/posts/2023-07/1688404965_kartin-papik-pro-p-kartinki-leta-v-visokom-kachestve-17.jpg'
			}
		.

		< .test-with-attrs &
			v-attrs = {
				id: 'test-id',
				'-test-ref': 'data-attribute',
				style: 'margin-top: 10px;',
				class: 'croatoan',
				'v-show': true,
				'v-safe-html': '<strong>Strong</strong>',
				'@click': () => console.log('click')
			}
		.

		< .test-with-safe-html v-safe-html = '<strong>Strong</strong>'

