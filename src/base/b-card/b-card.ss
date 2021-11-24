- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< .&__foo

		< .&__bar
			< @b-shopping-list-badge

		< .&__baz
