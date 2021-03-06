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
	{csp} = config,
	{getScriptDecl} = include('src/super/i-static-page/modules/ss-helpers/tags');

exports.getVarsDecl = getVarsDecl;

/**
 * Returns declaration of global variables to initialize the application.
 * You need to put this declaration within a script tag or use the "wrap" option.
 *
 * @param {boolean=} [wrap] - if true, the declaration is wrapped by a script tag
 * @returns {string}
 */
function getVarsDecl({wrap} = {}) {
	const decl = `
Object.defineProperty(window, '${csp.nonceStore()}', {
	value: ${csp.postProcessor ? JSON.stringify(csp.nonce()) : csp.nonce()}
});

var PATH = Object.create(null);

try {
	PATH = new Proxy(PATH, {
		get: function (target, prop) {
			if (prop in target) {
				var v = target[prop];
				return typeof v === 'string' ? v : v.publicPath || v.path;
			}

			throw new ReferenceError('A resource by the path "' + prop + '" is not defined');
		}
	});
} catch (_) {}`;

	return wrap ? getScriptDecl(decl) : decl;
}
