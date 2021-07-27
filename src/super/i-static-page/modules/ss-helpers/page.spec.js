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

			expect(fs.readFileSync(file).toString().replace(/^\s+|\t|\s+$/g, '')).toBe(
`Object.defineProperty(window, 'GLOBAL_NONCE', {
value: undefined
});

var PATH = Object.create(null);
var PUBLIC_PATH = undefined;

if (false) {
(function () {
var publicPath = /publicPath=([^&]+)/.exec(location.search);

if (publicPath != null) {
PUBLIC_PATH = decodeURIComponent(publicPath[1]);
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

throw new ReferenceError('A resource by the path "' + prop + '" is not defined');
}
});
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

(function () {
var el = document.createElement('link');

el.setAttribute('rel', 'preload');
el.setAttribute('as', 'style');
el.setAttribute('href', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['std_style']); })()));
document.head.appendChild(el);
})();

(function () {
var el = document.createElement('link');

el.setAttribute('href', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['std_style']); })()));
el.setAttribute('rel', 'stylesheet');
el.setAttribute('media', 'print');
el.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
document.head.appendChild(el);
})();

}

function $__RENDER_ROOT() {

(function () {
var el = document.createElement('main');
el.setAttribute('data-foo', 'bla');
el.setAttribute('class', 'i-static-page p-v4-components-demo');
document.body.appendChild(el);
})();



(function () {
var el = document.createElement('link');

el.setAttribute('rel', 'preload');
el.setAttribute('as', 'style');
el.setAttribute('href', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['p-v4-components-demo_style']); })()));
document.head.appendChild(el);
})();

(function () {
var el = document.createElement('link');

el.setAttribute('href', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['p-v4-components-demo_style']); })()));
el.setAttribute('rel', 'stylesheet');
el.setAttribute('media', 'print');
el.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
document.head.appendChild(el);
})();


if ('std' in PATH) {

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['std']); })()));
document.head.appendChild(el);
})();

}

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', '/dist/client/lib/requestidlecallback.js');
document.head.appendChild(el);
})();

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', '/dist/client/lib/eventemitter2.js');
document.head.appendChild(el);
})();

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', '/dist/client/lib/vue.js');
document.head.appendChild(el);
})();

if ('index-core' in PATH) {

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['index-core']); })()));
document.head.appendChild(el);
})();

}
if ('vendor' in PATH) {

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['vendor']); })()));
document.head.appendChild(el);
})();

}

(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['p-v4-components-demo_tpl']); })()));
document.head.appendChild(el);
})();


(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['p-v4-components-demo']); })()));
document.head.appendChild(el);
})();



(function () {
var el = document.createElement('script');
el.async = false;
el.setAttribute('src', ((function () { function concatURLs(a, b) {
return a.replace(/[\\\\/]+$/, '') + '/' + b.replace(/^[\\\\/]+/, '');
} return concatURLs('/dist/client', PATH['webpack.runtime']); })()));
document.head.appendChild(el);
})();

}`
			);
		});
	});
});
