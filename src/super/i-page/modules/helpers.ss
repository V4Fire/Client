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
- import path from 'upath'
- import hasha from 'hasha'

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
		: &
			newSrc,
			url,
			file
		.

		- if !libCache[basename]
			? file = fs.readFileSync(src)
			: hash = ''

			- if isProd
				? hash = hasha(src, {algorithm: 'md5'}).substr(0, @hashLength) + '_'

			? newSrc = path.join(@output, 'lib', hash + basename)
			? url = @fatHTML ? newSrc : path.relative(@output, newSrc)
			? libCache[basename] = fs.existsSync(newSrc) && url

		- if !libCache[basename]
			? fs.mkdirpSync(path.join(@output, 'lib'))
			? fs.writeFileSync(newSrc, file.toString().replace(/\/\/# sourceMappingURL=.*/, ''))
			? libCache[basename] = url

		- return libCache[basename]

	- return src

/**
 * Adds a script dependence
 *
 * @param {string} name - dependence name
 * @param {Object=} [opts] - additional options:
 *   *) [defer]
 *   *) [optional]
 */
- block index->addScriptDep(name, opts)
	: p = Object.assign({defer: true}, opts)

	- if @fatHTML
		- if assets[name]
			: url = path.join(@output, assets[name])

			- if fs.existsSync(url)
				requireMonic({url})

		- else if !p.optional
			- throw new Error('Script dependence with id "' + name +  '" is not defined')

	- else
		: putIn tpl
			document.write('<script src="' + PATH['{name}'] + '" {(p.defer ? \'defer="defer"\' : '')}><' + '/script>');

		- if p.optional
			# op
				if ('#{name}' in PATH) {
					#+= tpl
				}

		- else
			+= tpl

/**
 * Adds a link dependence
 *
 * @param {string} name - dependence name
 * @param {Object=} [opts] - additional options
 *   *) [optional]
 */
- block index->addStyleDep(name, opts)
	: &
		rname = name + '$style',
		p = Object.assign({}, opts)
	.

	- if @fatHTML
		- if assets[rname]
			: url = path.join(@output, assets[rname])

			- if fs.existsSync(url)
				requireMonic({url})

		- else if !p.optional
			- throw new Error('Style dependence with id "' + name +  '" is not defined')

	- else
		: putIn tpl
			document.write('<link rel="stylesheet" href="' + PATH['{rname}'] + '">');

		- if p.optional
			# op
				if ('#{rname}' in PATH) {
					#+= tpl
				}

		- else
			+= tpl

/**
 * Adds template dependencies
 *
 * @param {!Object} dependencies
 * @param {string=} [type] - type of dependencies
 */
- block index->addDependencies(dependencies, type)
	: list = dependencies[path.basename(__filename, '.ess')]

	- if !type || type === 'styles'
		- if @fatHTML
			- style
				- forEach list => el
					+= self.addStyleDep(el)

		- else
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
