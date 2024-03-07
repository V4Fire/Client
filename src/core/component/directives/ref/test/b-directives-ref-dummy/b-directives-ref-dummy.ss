- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/dummies/b-dummy'|b as placeholder

- template index() extends ['b-dummy'].index
	- block body
		- block testCases()
			< template v-if = stage === 'all components are regular'
				< b-dummy ref = component | id = main
					< b-dummy ref = slotComponent | id = slot
						< b-dummy ref = nestedSlotComponent | id = nested

			< template v-else-if = stage === 'all components are functional'
				< b-dummy ref = component | id = main | v-func = true
					< b-dummy ref = slotComponent | id = slot | v-func = true
						< b-dummy ref = nestedSlotComponent | id = nested | v-func = true

			< template v-else-if = stage === 'main component is functional and slot components are regular'
				< b-dummy ref = component | id = main | v-func = true
					< b-dummy ref = slotComponent | id = slot
						< b-dummy ref = nestedSlotComponent | id = nested

			< template v-else-if = stage === 'only one slot component is functional'
				< b-dummy ref = component | id = main
					< b-dummy ref = slotComponent | id = slot | v-func = true
						< b-dummy ref = nestedSlotComponent | id = nested

			< template v-else-if = stage === 'main component is regular and slot components are functional'
				< b-dummy ref = component | id = main
					< b-dummy ref = slotComponent | id = slot | v-func = true
						< b-dummy ref = nestedSlotComponent | id = nested | v-func = true

		< template v-if = useAsyncRender
			< . v-async-target
				+= self.render({wait: 'async.sleep.bind(async, 0)'})
					+= self.testCases()

		< template v-else
			+= self.testCases()
