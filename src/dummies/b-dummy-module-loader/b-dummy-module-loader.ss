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
		< template v-if = stage === 'loading dynamic modules from a template'
			< .&__result
				+= self.loadModules('b-dummy-module-loader/b-dummy-module-1')
					< b-dummy-module-1

				+= self.loadModules(['b-dummy-module-loader/b-dummy-module-1', 'b-dummy-module-loader/b-dummy-module-2'], { &
					wait: 'async.sleep.bind(async, 300)'
				}) .
					< b-dummy-module-1
					< b-dummy-module-2
