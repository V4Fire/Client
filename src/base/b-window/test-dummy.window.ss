- namespace b-window

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- eval
	? @@saveTplDir(__dirname, 'windowSlotTestDummy')

- block index->windowSlotTestDummy(nms)
	< ?.${nms}
		< .&__bla
			Hello world!
