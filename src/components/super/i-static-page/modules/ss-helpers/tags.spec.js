/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

/* eslint-disable max-lines-per-function,no-template-curly-in-string */

require('@config/config');

const
	ss = include('src/components/super/i-static-page/modules/ss-helpers');

describe('components/super/i-static-page/modules/ss-helpers/tags', () => {
	describe('`getScriptDecl`', () => {
		describe('providing `src`', () => {
			it('simple usage', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js'});

				expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js" defer></script>');
			});

			it('`src` to a folder', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/@v4fire/core/'});

				expect(decl).toBe('');
			});

			it('providing `load` as `false`', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', load: false});

				expect(decl).toBe('');
			});

			it('without deferred loading', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', defer: false});

				expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js"></script>');
			});

			it('with inlining', async () => {
				const
					decl = await ss.getScriptDecl({src: 'node_modules/@v4fire/core/gulpfile.js', inline: true});

				expect(decl).toBe("<script >include('node_modules/@v4fire/core/gulpfile.js');</script>");
			});

			it('with JS initializing', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', js: true});

				expect(decl).toBe(`
(function () {
	var el = document.createElement('script');
	el.async = false;
	el.setAttribute('src', 'node_modules/jquery/dist/jquery.js');
	document.head.appendChild(el);
})();
`);
			});

			it('with async JS initializing', () => {
				const decl = collapseSpaces(
					ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', js: true, attrs: {async: true}})
				);

				expect(decl).toBe(`
(function () {
	var el = document.createElement('script');
	el.setAttribute('src', 'node_modules/jquery/dist/jquery.js');
	document.head.appendChild(el);
})();
`);
			});

			it('with non-deferred JS initializing', () => {
				const
					decl = ss.getScriptDecl({src: 'node_modules/jquery/dist/jquery.js', js: true, defer: false});

				expect(decl).toBe('document.write(`<script src="node_modules/jquery/dist/jquery.js"` + \'><\' + \'/script>\');');
			});

			it('with JS initializing and inlining', async () => {
				const
					decl = await ss.getScriptDecl({src: 'node_modules/@v4fire/core/gulpfile.js', js: true, inline: true});

				expect(decl.trim()).toBe("include('node_modules/@v4fire/core/gulpfile.js');");
			});

			describe('providing additional attributes', () => {
				it('simple usage', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						attrs: {
							type: 'text/javascript',
							'data-bla': 'true'
						}
					});

					expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js" type="text/javascript" data-bla="true" defer></script>');
				});

				it('static attributes', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						attrs: {
							type: 'text/javascript',
							staticAttrs: 'foo="bar"'
						}
					});

					expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js" foo="bar" type="text/javascript" defer></script>');
				});

				it('as functions', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						attrs: {
							type: () => 'text/javascript'
						}
					});

					expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js" type="text/javascript" defer></script>');
				});

				it('with interpolation', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						attrs: {
							type: ['type']
						}
					});

					expect(decl).toBe('<script src="node_modules/jquery/dist/jquery.js" type="${type}" defer></script>');
				});

				it('with JS initializing and interpolation', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						js: true,
						attrs: {
							type: ['type']
						}
					});

					expect(decl).toBe(`
(function () {
	var el = document.createElement('script');
	el.async = false;
	el.setAttribute('src', 'node_modules/jquery/dist/jquery.js');
	el.setAttribute('type', type);
	document.head.appendChild(el);
})();
`);
				});

				it('with non-deferred JS initializing and interpolation', () => {
					const decl = ss.getScriptDecl({
						src: 'node_modules/jquery/dist/jquery.js',
						js: true,
						defer: false,
						attrs: {
							type: ['type']
						}
					});

					expect(decl).toBe('document.write(`<script src="node_modules/jquery/dist/jquery.js" type="${type}"` + \'><\' + \'/script>\');');
				});
			});
		});

		describe('providing scripts as texts', () => {
			it('simple usage', () => {
				const
					decl = ss.getScriptDecl({}, 'var a = 1;');

				expect(decl).toBe('<script >var a = 1;</script>');
			});

			it('with JS initializing', () => {
				const
					decl = ss.getScriptDecl({js: true}, 'var a = 1;').trim();

				expect(decl).toBe('var a = 1;');
			});

			describe('providing additional attributes', () => {
				it('simple usage', () => {
					const attrs = {
						attrs: {
							type: 'text/javascript',
							'data-bla': 'true'
						}
					};

					const
						decl = ss.getScriptDecl(attrs, 'var a = 1;');

					expect(decl).toBe('<script type="text/javascript" data-bla="true">var a = 1;</script>');
				});

				it('static attributes', () => {
					const attrs = {
						attrs: {
							type: 'text/javascript',
							staticAttrs: 'foo="bar"'
						}
					};

					const
						decl = ss.getScriptDecl(attrs, 'var a = 1;');

					expect(decl).toBe('<script foo="bar" type="text/javascript">var a = 1;</script>');
				});

				it('as functions', () => {
					const attrs = {
						attrs: {
							type: () => 'text/javascript'
						}
					};

					const
						decl = ss.getScriptDecl(attrs, 'var a = 1;');

					expect(decl).toBe('<script type="text/javascript">var a = 1;</script>');
				});

				it('with interpolation', () => {
					const attrs = {
						attrs: {
							type: ['type']
						}
					};

					const
						decl = ss.getScriptDecl(attrs, 'var a = 1;');

					expect(decl).toBe('<script type="${type}">var a = 1;</script>');
				});
			});
		});
	});

	describe('`getStyleDecl`', () => {
		describe('providing `src`', () => {
			it('simple usage', () => {
				const
					decl = ss.getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css'});

				expect(decl).toBe(
					'' +
					'<link rel="preload" as="style" href="node_modules/font-awesome/dist/font-awesome.css">' +
					'<link ' +
						'href="node_modules/font-awesome/dist/font-awesome.css" ' +
						'rel="stylesheet" ' +
						'media="print" ' +
						'onload="this.media=&#39;all&#39;; this.onload=null;">'
				);
			});

			it('without deferred loading', () => {
				const
					decl = ss.getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', defer: false});

				expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css" rel="stylesheet">');
			});

			it('with inlining', async () => {
				const
					decl = await ss.getStyleDecl({src: 'src/components/base/b-bottom-slide/b-bottom-slide.styl', inline: true});

				expect(decl).toBe("<style >include('src/components/base/b-bottom-slide/b-bottom-slide.styl');</style>");
			});

			it('with JS initializing', () => {
				const decl = collapseSpaces(
					ss.getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', js: true})
				);

				expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('rel', 'preload');
	el.setAttribute('as', 'style');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	document.head.appendChild(el);
})();
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('rel', 'stylesheet');
	el.setAttribute('media', 'print');
	el.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
	document.head.appendChild(el);
})();
`);
			});

			it('with non-deferred JS initializing', () => {
				const decl = collapseSpaces(
					ss.getStyleDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', js: true, defer: false})
				);

				expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('rel', 'stylesheet');
	document.head.appendChild(el);
})();
`);
			});

			it('with JS initializing and inlining', async () => {
				const decl = collapseSpaces(
					await ss.getStyleDecl({src: 'src/components/base/b-bottom-slide/b-bottom-slide.styl', js: true, inline: true})
				);

				expect(decl.trim()).toBe(`(function () {
	var el = document.createElement('style');
//#set convertToStringLiteral
el.innerHTML = include('src/components/base/b-bottom-slide/b-bottom-slide.styl');
//#unset convertToStringLiteral
	document.head.appendChild(el);
})();`);
			});

			describe('providing additional attributes', () => {
				it('simple usage', () => {
					const decl = ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						attrs: {
							type: 'text/css',
							'data-bla': 'true'
						}
					});

					expect(decl).toBe(
						'' +
						'<link type="text/css" data-bla="true" rel="preload" as="style" href="node_modules/font-awesome/dist/font-awesome.css">' +
						'<link ' +
							'type="text/css" ' +
							'data-bla="true" ' +
							'href="node_modules/font-awesome/dist/font-awesome.css" ' +
							'rel="stylesheet" ' +
							'media="print" ' +
							'onload="this.media=&#39;all&#39;; this.onload=null;">'
					);
				});

				it('static attributes', () => {
					const decl = ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						attrs: {
							type: 'text/css',
							staticAttrs: 'foo="bar"'
						}
					});

					expect(decl).toBe(
						'' +
						'<link foo="bar" type="text/css" rel="preload" as="style" href="node_modules/font-awesome/dist/font-awesome.css">' +
						'<link ' +
							'foo="bar" ' +
							'type="text/css" ' +
							'href="node_modules/font-awesome/dist/font-awesome.css" ' +
							'rel="stylesheet" ' +
							'media="print" ' +
							'onload="this.media=&#39;all&#39;; this.onload=null;">'
					);
				});

				it('as functions', () => {
					const decl = ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						defer: false,
						attrs: {
							type: () => 'text/css'
						}
					});

					expect(decl).toBe('<link type="text/css" href="node_modules/font-awesome/dist/font-awesome.css" rel="stylesheet">');
				});

				it('with interpolation', () => {
					const decl = ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						defer: false,
						attrs: {
							type: ['type']
						}
					});

					expect(decl).toBe('<link type="${type}" href="node_modules/font-awesome/dist/font-awesome.css" rel="stylesheet">');
				});

				it('with JS initializing and interpolation', () => {
					const decl = collapseSpaces(ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						js: true,
						attrs: {
							type: ['type']
						}
					}));

					expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('type', type);
	el.setAttribute('rel', 'preload');
	el.setAttribute('as', 'style');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	document.head.appendChild(el);
})();
(function () {
	var el = document.createElement('link');
	el.setAttribute('type', type);
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('rel', 'stylesheet');
	el.setAttribute('media', 'print');
	el.setAttribute('onload', 'this.media=\\'all\\'; this.onload=null;');
	document.head.appendChild(el);
})();
`);
				});

				it('with non-deferred JS initializing and interpolation', () => {
					const decl = collapseSpaces(ss.getStyleDecl({
						src: 'node_modules/font-awesome/dist/font-awesome.css',
						js: true,
						defer: false,
						attrs: {
							type: ['type']
						}
					}));

					expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('type', type);
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('rel', 'stylesheet');
	document.head.appendChild(el);
})();
`);
				});
			});
		});

		describe('providing styles as texts', () => {
			it('simple usage', () => {
				const
					decl = ss.getStyleDecl({}, '.foo { color: red; }');

				expect(decl).toBe('<style >.foo { color: red; }</style>');
			});

			it('with JS initializing', () => {
				const decl = collapseSpaces(
					ss.getStyleDecl({js: true}, '.foo { color: red; }').trim()
				);

				expect(decl).toBe(`(function () {
	var el = document.createElement('style');
	el.innerHTML = \`.foo { color: red; }\`;
	document.head.appendChild(el);
})();`);
			});

			describe('providing additional attributes', () => {
				it('simple usage', () => {
					const attrs = {
						attrs: {
							type: 'text/css',
							'data-bla': 'true'
						}
					};

					const
						decl = ss.getStyleDecl(attrs, '.foo { color: red; }');

					expect(decl).toBe('<style type="text/css" data-bla="true">.foo { color: red; }</style>');
				});

				it('static attributes', () => {
					const attrs = {
						attrs: {
							type: 'text/css',
							staticAttrs: 'foo="bar"'
						}
					};

					const
						decl = ss.getStyleDecl(attrs, '.foo { color: red; }');

					expect(decl).toBe('<style foo="bar" type="text/css">.foo { color: red; }</style>');
				});

				it('as functions', () => {
					const attrs = {
						attrs: {
							type: () => 'text/css'
						}
					};

					const
						decl = ss.getStyleDecl(attrs, '.foo { color: red; }');

					expect(decl).toBe('<style type="text/css">.foo { color: red; }</style>');
				});

				it('with interpolation', () => {
					const attrs = {
						attrs: {
							type: ['type']
						}
					};

					const
						decl = ss.getStyleDecl(attrs, '.foo { color: red; }');

					expect(decl).toBe('<style type="${type}">.foo { color: red; }</style>');
				});
			});
		});
	});

	describe('`getLinkDecl`', () => {
		it('simple usage', () => {
			const
				decl = ss.getLinkDecl({src: 'node_modules/font-awesome/dist/font-awesome.css'});

			expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css">');
		});

		it('with JS initializing', () => {
			const decl = collapseSpaces(
				ss.getLinkDecl({src: 'node_modules/font-awesome/dist/font-awesome.css', js: true})
			);

			expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	document.head.appendChild(el);
})();
`);
		});

		describe('providing additional attributes', () => {
			it('simple usage', () => {
				const decl = ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					attrs: {
						type: 'text/css',
						'data-bla': 'true'
					}
				});

				expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css" type="text/css" data-bla="true">');
			});

			it('static attributes', () => {
				const decl = ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					attrs: {
						type: 'text/css',
						staticAttrs: 'foo="bar"'
					}
				});

				expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css" foo="bar" type="text/css">');
			});

			it('as functions', () => {
				const decl = ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					defer: false,
					attrs: {
						type: () => 'text/css'
					}
				});

				expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css" type="text/css">');
			});

			it('with interpolation', () => {
				const decl = ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					defer: false,
					attrs: {
						type: ['type']
					}
				});

				expect(decl).toBe('<link href="node_modules/font-awesome/dist/font-awesome.css" type="${type}">');
			});

			it('with JS initializing and interpolation', () => {
				const decl = collapseSpaces(ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					js: true,
					attrs: {
						type: ['type']
					}
				}));

				expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('type', type);
	document.head.appendChild(el);
})();
`);
			});

			it('static attributes with JS initializing and interpolation', () => {
				const decl = collapseSpaces(ss.getLinkDecl({
					js: true,
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					staticAttrs: 'rel="manifest"',
					attrs: {
						href: ["'manifest.json?from=' + location.pathname + location.search"]
					}
				}));

				expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'manifest.json?from=' + location.pathname + location.search);
	var tmpEl = document.createElement('div');
	tmpEl.innerHTML = '<div rel="manifest"></div>';
	tmpEl = tmpEl.children[0];
	var tmpElAttrs = tmpEl.attributes;
	for (var i = 0; i < tmpElAttrs.length; i++) {
		el.setAttribute(tmpElAttrs[i].name, tmpElAttrs[i].value);
	}
	document.head.appendChild(el);
})();
`);
			});

			it('with non-deferred JS initializing and interpolation', () => {
				const decl = collapseSpaces(ss.getLinkDecl({
					src: 'node_modules/font-awesome/dist/font-awesome.css',
					js: true,
					defer: false,
					attrs: {
						type: ['type']
					}
				}));

				expect(decl).toBe(`
(function () {
	var el = document.createElement('link');
	el.setAttribute('href', 'node_modules/font-awesome/dist/font-awesome.css');
	el.setAttribute('type', type);
	document.head.appendChild(el);
})();
`);
			});
		});
	});

	function collapseSpaces(str) {
		return str.replace(/\s+\n/g, '\n');
	}
});
