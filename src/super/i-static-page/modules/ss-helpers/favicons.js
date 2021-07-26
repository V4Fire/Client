/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	{src, webpack, favicons} = require('config');

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
 * @returns {string}
 */
function getFaviconsDecl() {
	const
		faviconsFolder = include(src.rel('assets', 'favicons'), {return: 'path'}),
		faviconsHTML = path.join(faviconsFolder, favicons().html);

	if (!fs.existsSync(faviconsHTML)) {
		return '';
	}

	const
		pathPlaceholderRgxp = /\$faviconPublicPath\//g,
		dest = resolveAsLib({name: 'favicons', dest: 'assets'}, src.rel('assets'), 'favicons/');

	glob.sync(src.clientOutput(dest, '*.@(json|xml|html|webapp)')).forEach((file) => {
		fs.writeFileSync(file, resolveFaviconPath(fs.readFileSync(file).toString()));
	});

	const
		manifestRgxp = /<(link|meta)\s(.*?)\b(content|href)="(\$faviconPublicPath\/.*?)"(.*?)\/?>/g,
		faviconsDecl = fs.readFileSync(faviconsHTML).toString();

	return faviconsDecl.replace(manifestRgxp, (str, tag, attrs1, hrefAttr, href, attrs2) => {
		href = addPublicPath(href.replace(pathPlaceholderRgxp, ''));

		if (/manifest.json$/.test(href)) {
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

	function resolveFaviconPath(str) {
		return str.replace(pathPlaceholderRgxp, `${webpack.publicPath(dest)}/`.replace(/\/+$/, '/'));
	}
}
