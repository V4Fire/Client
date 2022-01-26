- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		b-test-component

		///		<
		///			+= self.loadModules('base/b-test-component/modules/b-test-component-inner', {renderKey: 'b-test-component-inner'})
		///				< b-test-component-inner

		< b-test-component-inner
