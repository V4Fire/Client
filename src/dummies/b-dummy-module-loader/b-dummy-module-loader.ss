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
				+= self.loadModules('dummies/b-dummy-module-loader/b-dummy-module1')
					< b-dummy-module1

				+= self.loadModules(['dummies/b-dummy-module-loader/b-dummy-module1', 'dummies/b-dummy-module-loader/b-dummy-module2'], { &
					wait: 'async.sleep.bind(async, 300)'
				}) .
					< b-dummy-module1
					< b-dummy-module2

		< template v-if = stage === 'loading dynamic modules passed from the prop'
			< .&__result
				< b-dummy-module1
				< b-dummy-module2
