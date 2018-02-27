- namespace [%fileName%]

- include 'blocks/i-block'|b as placeholder

- template index(params) extends ['i-block'].index
	- rootTag = 'span'

	- block body
		< svg.&__svg
			< slot name = svgLink
