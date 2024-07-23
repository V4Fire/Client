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
		< template v-if = stage === 'with effect'
			< b-effect-prop-dummy ref = child | :data = someField

		< template v-else-if = stage === 'v-attrs with effect'
			< b-effect-prop-dummy ref = child | v-attrs = {data: someField}

		< template v-else-if = stage === 'without effect'
			< b-non-effect-prop-dummy ref = child | :data = someField

		< template v-else-if = stage === 'component :is without effect'
			< component &
				ref = child |
				:is = 'b-non-effect-prop-dummy' |
				:instanceOf = bNonEffectPropDummy |
				:data = someField
			.

		< template v-else-if = stage === 'v-attrs without effect'
			< b-non-effect-prop-dummy ref = child | v-attrs = {'@:data': createPropAccessors(() => someField)}

		< template v-else-if = stage === 'functional without effect'
			< b-non-effect-prop-dummy ref = child | :data = someField | v-func = true

		< template v-else-if = stage === 'functional v-attrs without effect'
			< b-non-effect-prop-dummy ref = child | v-func = true | v-attrs = {'@:data': createPropAccessors(() => someField)}

		< template v-else-if = stage === 'component :is with v-attrs'
			< component &
				v-if = testComponent |
				:is = testComponent |
				v-attrs = testComponentAttrs
			.