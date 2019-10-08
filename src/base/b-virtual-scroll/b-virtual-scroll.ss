- namespace [%fileName%]

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__container ref = container

		< .&__tombstone ref = tombstone
			+= self.slot('tombstone')