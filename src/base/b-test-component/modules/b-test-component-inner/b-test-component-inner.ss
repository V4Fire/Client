- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		b-test-component-inner
