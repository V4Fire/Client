- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
					< b-tree &
          	/// The specified items are rendered as `b-checkbox`-es
          	:item = 'b-checkbox' |
          	:activeProp = 'bar' |
          	:items = [
          		{id: '1', label: 'bar', value: 'bar'},
          		{id: '2', label: 'foo', value: 'foo', children: [
          			{id: '3', label: 'foo1', value: 'foo1'},
          			{id: '4', label: 'foo2', value: 'foo2'},

          			{
          				id: '5',
          				label: 'foo3',
          				value: 'foo3',
          				children: [
          					{id: '6', label: 'foo4', value: 'foo4'}
          				]
          			},

          			{id: '7', label: 'foo5', value: 'foo5'}
          		]}
          	]
          .
