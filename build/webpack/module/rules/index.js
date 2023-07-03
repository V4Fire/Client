/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

exports.typescript = include('build/webpack/module/rules/typescript');

exports.javascript = include('build/webpack/module/rules/javascript');

exports.stylus = include('build/webpack/module/rules/stylus');

exports.snakeskin = include('build/webpack/module/rules/snakeskin');

exports.executableSnakeskin = include('build/webpack/module/rules/executable-snakeskin');

exports.assets = include('build/webpack/module/rules/assets');

exports.images = include('build/webpack/module/rules/images');

exports.imagesWebp = include('build/webpack/module/rules/images-webp');

exports.imagesSvg = include('build/webpack/module/rules/images-svg');
