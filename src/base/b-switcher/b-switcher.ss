- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block body
		< .&__placeholder ref = placeholder
			+= self.slot('placeholder')

		< .&__content ref = content
			+= self.slot('content')
