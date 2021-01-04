/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config');

const
	glob = require('glob'),
	fs = require('fs-extra-promise'),
	path = require('upath');

const
	{getScriptDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags');

exports.getFaviconsDecl = getFaviconsDecl;

/**
 * Returns declaration of project favicons
 * @returns {string}
 */
function getFaviconsDecl() {
	const
		faviconsSrc = glob.sync(path.join(config.favicons().path, '*.html'))[0];

	if (!faviconsSrc) {
		return '';
	}

	let
		faviconsDecl = fs.readFileSync(faviconsSrc).toString();

	const
		manifestRgxp = /<link (.*?) href="(.*?\/manifest.json)">/,
		manifest = manifestRgxp.exec(faviconsDecl);

	faviconsDecl = faviconsDecl.replace(manifestRgxp, '');

	const manifestDecl = getLinkDecl({
		js: true,
		defer: false,
		staticAttrs: `${manifest[1]} href="${manifest[2]}?from=\${location.href}"`
	});

	return faviconsDecl + getScriptDecl(manifestDecl);
}
