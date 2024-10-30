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
	- block body
		< b-button @onClick = openBottomSlide
			Open bottom slide

		< . v-async-target
			+= self.loadModules('components/dummies/b-dummy')
				< b-dummy
					< . v-async-target
						+= self.loadModules('components/base/b-bottom-slide')
							< b-bottom-slide.&__bottom-slide ref = bottomSlide | :heightMode = heightMode
								< p
									Height mode: {{ heightMode }}

								< b-button @onClick = triggerHeightMode
									Trigger height mode
