/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	fs = require('fs-extra'),
	{src, webpack} = require('config');

const
	ss = include('src/super/i-static-page/modules/ss-helpers'),
	deps = include('src/super/i-static-page/deps');

const entryPoints = {
	std: ['std'],
	'p-v4-components-demo': ['p-v4-components-demo']
};

describe('super/i-static-page/modules/ss-helpers/page', () => {
	const assets = ss.getAssets(entryPoints);

	describe('`generateInitJS`', () => {
		it('simple usage', async () => {
			const
				name = 'p-v4-components-demo',
				file = src.clientOutput(`${webpack.output({name})}.init.js`);

			fs.unlinkSync(file);

			await ss.generateInitJS(name, {
				deps,
				ownDeps: entryPoints[name],

				assets: await assets,
				rootTag: 'main',

				rootAttrs: {
					'data-foo': 'bla'
				}
			});

			expect(fs.readFileSync(file).toString()).toBe(
`
Object.defineProperty(window, 'GLOBAL_NONCE', {
\tvalue: undefined
});

var PATH = Object.create(null);
var PUBLIC_PATH = undefined;

if (false) {
\t(function () {
\t\tvar publicPath = /publicPath=([^&]+)/.exec(location.search);

\t\tif (publicPath != null) {
\t\t\tPUBLIC_PATH = decodeURIComponent(publicPath[1]);
\t\t}
\t})();
}

try {
\tPATH = new Proxy(PATH, {
\t\tget: function (target, prop) {
\t\t\tif (prop in target) {
\t\t\t\tvar v = target[prop];
\t\t\t\treturn typeof v === 'string' ? v : v.publicPath || v.path;
\t\t\t}

\t\t\tthrow new ReferenceError('A resource by the path "' + prop + '" is not defined');
\t\t}
\t});
} catch (_) {}
PATH['p-v4-components-demo'] = 'p-v4-components-demo.js';
PATH['p-v4-components-demo_tpl'] = 'p-v4-components-demo_tpl.js';
PATH['webpack.runtime'] = 'webpack.runtime.js';
PATH['vendor'] = 'vendor.js';
PATH['std'] = 'std.js';
PATH['std_tpl'] = 'std_tpl.js';
PATH['std_style'] = 'std_style.css';
PATH['p-v4-components-demo_style'] = 'p-v4-components-demo_style.css';
PATH['std_view'] = 'std_view.js';
PATH['p-v4-components-demo_view'] = 'p-v4-components-demo_view.js';


if ('std_style' in PATH) {
\t
(function () {
\tvar el = document.createElement('link');
\t
\tel.setAttribute('rel', 'preload');
\tel.setAttribute('as', 'style');
\tel.setAttribute('href', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['std_style']); })()));
\tdocument.head.appendChild(el);
})();

(function () {
\tvar el = document.createElement('link');
\t
\tel.setAttribute('href', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['std_style']); })()));
\tel.setAttribute('rel', 'stylesheet');
\tel.setAttribute('media', 'print');
\tel.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
\tdocument.head.appendChild(el);
})();

}

function $__RENDER_ROOT() {
\t
(function () {
\tvar el = document.createElement('main');
\tel.setAttribute('data-foo', 'bla');
\tel.setAttribute('class', 'i-static-page p-v4-components-demo');
\tdocument.body.appendChild(el);
})();



(function () {
\tvar el = document.createElement('link');
\t
\tel.setAttribute('rel', 'preload');
\tel.setAttribute('as', 'style');
\tel.setAttribute('href', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['p-v4-components-demo_style']); })()));
\tdocument.head.appendChild(el);
})();

(function () {
\tvar el = document.createElement('link');
\t
\tel.setAttribute('href', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['p-v4-components-demo_style']); })()));
\tel.setAttribute('rel', 'stylesheet');
\tel.setAttribute('media', 'print');
\tel.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
\tdocument.head.appendChild(el);
})();


if ('std' in PATH) {
\t
(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['std']); })()));
\tdocument.head.appendChild(el);
})();

}

(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', '/dist/client/lib/requestidlecallback.js');
\tdocument.head.appendChild(el);
})();

(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', '/dist/client/lib/eventemitter2.js');
\tdocument.head.appendChild(el);
})();

(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', '/dist/client/lib/vue.js');
\tdocument.head.appendChild(el);
})();

if ('index-core' in PATH) {
\t
(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['index-core']); })()));
\tdocument.head.appendChild(el);
})();

}
if ('vendor' in PATH) {
\t
(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['vendor']); })()));
\tdocument.head.appendChild(el);
})();

}

(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['p-v4-components-demo_tpl']); })()));
\tdocument.head.appendChild(el);
})();


(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['p-v4-components-demo']); })()));
\tdocument.head.appendChild(el);
})();



(function () {
\tvar el = document.createElement('script');
\tel.async = false;
\tel.setAttribute('src', ((function () { function concatURLs(a, b) {
\t\treturn a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
\t} return concatURLs('/dist/client', PATH['webpack.runtime']); })()));
\tdocument.head.appendChild(el);
})();

}

`
			);
		});
	});
});
