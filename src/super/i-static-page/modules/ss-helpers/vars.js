/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('config'),
	globals = include('build/globals.webpack');

const
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags');

exports.getVarsDecl = getVarsDecl;

/**
 * Returns declaration of global variables to initialize the application.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {Object<string>=} [assets] - map with assets
 * @param {boolean=} [wrap=false] - if true, the declaration is wrapped by a script tag
 * @returns {string}
 */
function getVarsDecl({assets, wrap} = {}) {
	const decl = `
window[${globals.MODULE_DEPENDENCIES}] = {fileCache: Object.create(null)};

var READY_STATE = 0;

var GLOBAL_NONCE = '${config.csp.nonce() || ''}';

var PATH = ${JSON.stringify(assets || {}, null, 2)};

try {
	PATH = new Proxy(PATH, {
		get: function (target, prop) {
			if (target.hasOwnProperty(prop)) {
				var v = target[prop];
				return typeof v === 'string' ? v : v.publicPath || v.path;
			}

			console.log(target);
			throw new ReferenceError('A resource by the path "' + prop + '" is not defined');
		}
	});
} catch(_) {}`;

	return wrap ? getScriptDecl(decl) : decl;
}
