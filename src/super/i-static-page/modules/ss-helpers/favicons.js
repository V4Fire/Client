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
	fs = require('fs-extra');

const
	{getScriptDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags');

exports.getFaviconsDecl = getFaviconsDecl;

/**
 * Returns declaration of project favicons
 * @returns {string}
 */
function getFaviconsDecl() {
	const
		faviconsSrc = glob.sync(src.assets('favicons', favicons().html))[0];

	if (!faviconsSrc) {
		return '';
	}

	let
		faviconsDecl = fs.readFileSync(faviconsSrc).toString();

	const
		manifestRgxp = /<link (.*?) href="(.*?\/manifest.json)">/,
		manifest = manifestRgxp.exec(faviconsDecl);

	faviconsDecl = faviconsDecl
		.replace(manifestRgxp, '')
		.replace(/\$publicPath\//g, webpack.publicPath().replace(/^(.*)\/?$/, (str, path) => {
			if (str.length) {
				return `${path}/`;
			}

			return '';
		}));

	const manifestDecl = getLinkDecl({
		js: true,
		defer: false,
		staticAttrs: `${manifest[1]} href="${manifest[2]}?from=\${location.href}"`
	});

	return faviconsDecl + getScriptDecl(manifestDecl);
}
