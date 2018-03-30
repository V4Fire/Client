- namespace ['i-page.interface']

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- import fs from 'fs-extra-promise'
- import path from 'path'
- import hasha from 'hasha'

/**
 * Normalizes the specified url
 * @param {string} url
 */
- block index->normalize(url)
	- return url.replace(/\\/g, '/')

/**
 * Injects the specified file to the template
 * @param {string} src
 */
- block index->inject(src)
	- return fs.readFileSync(src).toString()

: &
	libCache = Object.create(null),
	foldersCache = Object.create(null)
.

/**
 * Joins the specified urls
 * @param {...string} url
 */
- block index->join()
	: last = arguments[arguments.length - 1]

	- if /(https?:)?\/\//.test(last)
		- return last

	: src = path.join.apply(path, arguments)
	: basename = path.basename(src)

	- if path.extname(basename)
		: newSrc, relativeSrc, file

		- if !libCache[basename]
			? file = fs.readFileSync(src)
			: hash = ''

			- if isProd
				? hash = hasha(src, {algorithm: 'md5'}).substr(0, @hashLength) + '_'

			? newSrc = path.join(@output, 'lib', hash + basename)
			? relativeSrc = path.relative(@output, newSrc)
			? libCache[basename] = fs.existsSync(newSrc) && relativeSrc

		- if !libCache[basename]
			? fs.mkdirpSync(path.join(@output, 'lib'))
			? fs.writeFileSync(newSrc, file.toString().replace(/\/\/# sourceMappingURL=.*/, ''))
			? libCache[basename] = relativeSrc

		- return self.normalize(libCache[basename])

	- return self.normalize(src)

/**
 * Adds a script dependence
 * @param {string=} [name] - dependence name
 */
- block index->addScriptDep(name)
	? name = self.normalize(name)
	document.write('<script src="' + PATH['{name}'] + '" defer="defer"><' + '/script>');

/**
 * Adds a link dependence
 * @param {string=} [name] - dependence name
 */
- block index->addStyleDep(name)
	? name = self.normalize(name)
	document.write('<link rel="stylesheet" href="' + PATH['{name}$style'] + '">');

/**
 * Adds template dependencies
 *
 * @param {!Object} dependencies
 * @param {string=} [type] - type of dependencies
 */
- block index->addDependencies(dependencies, type)
	: list = dependencies[path.basename(__filename, '.ess')]

	- if !type || type === 'styles'
		- script
			- forEach list => el
				+= self.addStyleDep(el)

	- if !type || type === 'scripts'
		- script
			- forEach list => el
				: tpl = el + '_tpl'

				- if el === 'index'
					+= self.addScriptDep(el)
					+= self.addScriptDep(tpl)

				- else
					+= self.addScriptDep(tpl)
					+= self.addScriptDep(el)

				ModuleDependencies.fileCache['{el}'] = true;
