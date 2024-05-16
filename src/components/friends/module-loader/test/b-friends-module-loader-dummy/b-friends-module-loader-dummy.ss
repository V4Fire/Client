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
		< template v-if = stage === 'loading dynamic modules from a template'
			< .&__result v-async-target
				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1')
					< b-friends-module-loader-dummy1

				+= self.loadModules(['components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1', 'components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy2'], { &
					wait: 'async.sleep.bind(async, 300)'
				}) .
					< b-friends-module-loader-dummy1
					< b-friends-module-loader-dummy2

		< template v-if = stage === 'loading dynamic modules passed from the prop'
			< .&__result
				< b-friends-module-loader-dummy1
				< b-friends-module-loader-dummy2

		< template v-if = stage === 'simultaneous loadModules calls should function independently'
			< .&__result v-async-target
				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1', { &
					wait: "localEmitter.promisifyOnce.bind(null, 'dummy1')"
				}) .
					< b-friends-module-loader-dummy1

				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy2', { &
					wait: "localEmitter.promisifyOnce.bind(null, 'dummy2')"
				}) .
					< b-friends-module-loader-dummy2

		< template v-if = stage === 'load the module only after the wait is resolved'
			< .&__result v-async-target
				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1')
					< b-friends-module-loader-dummy1

				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy2', { &
					wait: "localEmitter.promisifyOnce.bind(null, 'dummy2')"
				}) .
					< b-friends-module-loader-dummy2

		< template v-if = stage === 'load the module only after the signal is received'
			< .&__result v-async-target
				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy1')
					< b-friends-module-loader-dummy1

				+= self.loadModules('components/friends/module-loader/test/b-friends-module-loader-dummy/b-friends-module-loader-dummy2', { &
					wait: "moduleLoader.waitSignal('dummy2')"
				}) .
					< b-friends-module-loader-dummy2
