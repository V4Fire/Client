/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src, webpack, favicons} = require('@config/config');

const
	glob = require('glob'),
	fs = require('fs-extra'),
	path = require('upath');

const
	{resolveAsLib} = include('src/super/i-static-page/modules/ss-helpers/libs'),
	{getScriptDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{addPublicPath} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.getFaviconsDecl = getFaviconsDecl;

/**
 * Returns declaration of project favicons
 *
 * @returns {string}
 */
function getFaviconsDecl() {
	const
		params = favicons(),
		faviconsFolder = include(src.rel('assets', 'favicons'), {return: 'path'});

	if (params.src == null || params.html == null) {
		return '';
	}

	const
		faviconsHTMLSrc = path.join(faviconsFolder, params.html);

	if (!fs.existsSync(faviconsHTMLSrc)) {
		return '';
	}

	const
		pathPlaceholderRgxp = /\/\$faviconPublicPath\//g,
		dest = resolveAsLib({dest: 'assets'}, faviconsFolder);

	if (webpack.dynamicPublicPath()) {
		const
			tagWithPlaceholderRgxp = /<(link|meta)\s(.*?)\b(content|href)="(\$faviconPublicPath\/.*?)"(.*?)\/?>/g,
			faviconsDecl = fs.readFileSync(faviconsHTMLSrc).toString();

		return faviconsDecl.replace(tagWithPlaceholderRgxp, (str, tag, attrs1, hrefAttr, href, attrs2) => {
			href = addPublicPath(href.replace(pathPlaceholderRgxp, `${dest}/`));

			if (/\bmanifest.json$/.test(href)) {
				href = [`${href} + '?from=' + location.pathname + location.search`];
			}

			return getScriptDecl(getLinkDecl({
				tag,
				js: true,
				staticAttrs: attrs1 + attrs2,
				attrs: {
					[hrefAttr]: href
				}
			}));
		});
	}

	glob.sync(src.clientOutput(dest, '*.@(json|xml|html|webapp)')).forEach((file) => {
		fs.writeFileSync(file, resolveFaviconPath(fs.readFileSync(file).toString()));
	});

	if (params.copyManifest) {
		fs.copyFileSync(src.clientOutput(dest, 'manifest.json'), src.clientOutput('manifest.json'));
	}

	const
		manifestRgxp = /<link\s(.*?)\bhref="(.*?\bmanifest.json)"(.*?)\/?>/g,
		faviconsDecl = fs.readFileSync(src.clientOutput(dest, params.html)).toString();

	return faviconsDecl.replace(manifestRgxp, (str, attrs1, href, attrs2) => getScriptDecl(getLinkDecl({
		js: true,
		staticAttrs: attrs1 + attrs2,
		attrs: {
			href: [`'${href}?from=' + location.pathname + location.search`]
		}
	})));

	function resolveFaviconPath(str) {
		return str.replace(pathPlaceholderRgxp, `${webpack.publicPath(dest)}/`.replace(/\/+$/, '/'));
	}
}
