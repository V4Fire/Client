- namespace [%fileName%]

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- block rootAttrs
		? Object.assign(rootAttrs, {'@click': 'onClick'})

	- block body
		< .&__toggler ref = toggleContainer
			< .&__add-to-list

		< .&__count-container ref = countContainer
			< template v-for = _ in asyncRender.iterate(true, {filter: getContentRenderFilter, useRAF: true})
				< .&__count
					1
