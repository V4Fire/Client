- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- @@ignore
- template index(@params, content)
	- block body
		+= @self.slot('default')
			{content}
