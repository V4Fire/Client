/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

require('@config/config');

const
	ss = include('src/components/super/i-static-page/modules/ss-helpers'),
	deps = include('src/components/super/i-static-page/deps');

const styles = new Map([
	['font-awesome', {source: 'src', src: 'components/base/b-bottom-slide/b-bottom-slide.styl'}],
	['animate', {source: 'output', src: 'animate/dist/animate'}]
]);

const entryPoints = {
	std: ['std'],
	'p-v4-components-demo': ['p-v4-components-demo']
};

describe('components/super/i-static-page/modules/ss-helpers/libs', () => {
	const assets = ss.getAssets(entryPoints);

	describe('`loadLibs`', () => {
		it('loading from `deps.scripts`', async () => {
			const
				decl = await ss.loadLibs(deps.scripts, {assets: await assets});

			expect(decl).toBe(
				'' +
				'<script src="/dist/client/lib/requestidlecallback.js" defer></script>' +
				'<script src="/dist/client/lib/eventemitter2.js" defer></script>' +
				'<script src="/dist/client/lib/vue.js" defer></script>'
			);
		});

		it('loading from `deps.scripts` as JS', async () => {
			const
				decl = await ss.loadLibs(deps.scripts, {assets: await assets, js: true});

			expect(decl).toBe(`
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
`);
		});

		it('loading from `deps.scripts` as JS with wrapping', async () => {
			const
				decl = await ss.loadLibs(deps.scripts, {assets: await assets, js: true, wrap: true});

			expect(decl).toBe(`<script >
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
</script>`);
		});
	});

	describe('`loadStyles`', () => {
		it('loading from a Map', async () => {
			const decl = (await ss.loadStyles(styles, {assets: await assets}))
				.replace(/[\n\t]/g, '');

			expect(decl).toBe(
				'' +
				'<link rel="preload" as="style" href="/dist/client/lib/font-awesome.styl">' +
				'<link ' +
					'href="/dist/client/lib/font-awesome.styl" ' +
					'rel="stylesheet" ' +
					'media="print" ' +
					'onload="this.media=&#39;all&#39;; this.onload=null;">' +

				'<link rel="preload" as="style" href="/dist/client/animate/dist/animate">' +
				'<link ' +
					'href="/dist/client/animate/dist/animate" ' +
					'rel="stylesheet" ' +
					'media="print" ' +
					'onload="this.media=&#39;all&#39;; this.onload=null;">'
			);
		});

		describe('`loadLinks`', () => {
			it('loading from a Map', async () => {
				const decl = (await ss.loadLinks(styles, {assets: await assets}))
					.replace(/[\n\t]/g, '');

				expect(decl).toBe('<link href="/dist/client/lib/font-awesome.styl"><link href="/dist/client/animate/dist/animate">');
			});
		});
	});
});
