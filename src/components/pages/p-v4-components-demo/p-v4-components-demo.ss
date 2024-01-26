- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder
- include 'components/global/g-slider/g-slider.ss'|b

- template index() extends ['i-static-page.component'].index

	- block body
		- block slides()
			< img src = https://fakeimg.pl/175x300
			< img src = https://fakeimg.pl/225x300
			< img src = https://fakeimg.pl/375x300
			< img src = https://fakeimg.pl/375x300
			< img src = https://fakeimg.pl/375x300
			< img src = https://fakeimg.pl/375x300

		+= self.getTpl('g-slider/')()
			+= self.slides()


