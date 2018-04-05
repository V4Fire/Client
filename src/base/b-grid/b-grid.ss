- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data-pages'|b as placeholder

- template index() extends ['i-data-pages'].index
	- overWrapper = false
	- colCount = 1

	- block body
		- super

		/**
		 * Sets a sort trigger to the specified content
		 *
		 * @param {string} field
		 * @param {string} content
		 */
		- block sort(field, content)
			< button:a.&__sort-field @click = setSort('${field}')
				{content}

			< span &
				@click = toggleDir |
				:class = getElClasses({dir: {active: requestParams.get.sort === '${field}'}}) |
				-value = ${field}
			.
				< b-icon :value = 'expand_' + (requestParams.get.dir === 'desc' ? 'more' : 'less')

		/**
		 * Returns th declaration for a table
		 *
		 * @param {string} title
		 * @param {string=} [sort] - sort field name
		 */
		- block th(title, sort)
			< th
				< .&__th
					: putIn content
						{{ t('${title}') }}

					- if sort
						+= self.sort(sort)
							{content}

					- else
						{content}

		/**
		 * Returns a paging component
		 *
		 * @param {string=} [vIf] - additional v-if rule
		 * @param {Object=} [props] - additional props for b-paging
		 */
		- block paging(vIf, props)
			< tr v-if = db && Math.ceil(db.total / perPage) > 1 ${vIf ? '&&' + vIf : ''}
				< td.&__paging colspan = ${colCount}
					< b-paging &
						:blockName = 'paging' |
						:dispatching = true |
						:count = Math.ceil(db.total / perPage) |
						:current = pageIndex |
						${props}
					.

		- block grid
			< table.&__table
				< thead.&__thead
					- block thead

				< tfoot
					< tr v-if = !db || m.progress === 'true' && m.loading === 'true'
						- block progress
							< td.&__progress colspan = ${colCount}
								< b-progress-icon v-once

				< tbody.&__tbody v-if = db
					- block tbody

		- block loadPageTrigger
			< . ref = loadPageTrigger
