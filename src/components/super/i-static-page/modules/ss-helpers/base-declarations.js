/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const
	{webpack, csp, i18n} = require('@config/config'),
	{getScriptDecl} = include('src/components/super/i-static-page/modules/ss-helpers/tags');

exports.getVarsDecl = getVarsDecl;

/**
 * Returns the declaration of global variables to initialize the application.
 * You need to put this declaration within a `<script>` tag or use the `wrap` option.
 *
 * @param {object} [opts] - additional options
 * @param {boolean} [opts.wrap] - if set to true, the declaration will be wrapped by a `<script>` tag
 * @returns {string}
 */
function getVarsDecl({wrap} = {}) {
	const decl = `
Object.defineProperty(window, '${csp.nonceStore()}', {
	value: ${csp.postProcessor ? JSON.stringify(csp.nonce()) : csp.nonce()}
});

var ${i18n.langPacksStore} = {};

var PATH = Object.create(null);
var PUBLIC_PATH = ${Object.isString(webpack.dynamicPublicPath()) ? `String(${webpack.dynamicPublicPath()}).trim()` : 'undefined'};

if (${Boolean(webpack.providePublicPathWithQuery())}) {
	(function () {
		var publicPath = /publicPath=([^&]+)/.exec(location.search);

		if (publicPath != null) {
			PUBLIC_PATH = decodeURIComponent(publicPath[1]);
			PUBLIC_PATH = PUBLIC_PATH.replace(/\\/+$/, '') + '/';
		}
	})();
}

try {
	PATH = new Proxy(PATH, {
		get: function (target, prop) {
			if (prop in target) {
				var v = target[prop];
				return typeof v === 'string' ? v : v.publicPath || v.path;
			}

			throw new ReferenceError('The resource at the path "' + prop + '" is not defined');
		}
	});
} catch (_) {}`;

	return wrap ? getScriptDecl(decl) : decl;
}
