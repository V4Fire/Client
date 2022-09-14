'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	config = require('@config/config'),
	favicons = require('favicons'),
	Vinyl = require('vinyl');

Object.assign(
	exports,
	include('build/helpers')
);

/**
 * Waits till the specified callback function returns true
 *
 * @param {!Function} cb
 * @param {number} interval
 * @returns {!Promise<void>}
 */
exports.wait = function wait(cb, interval = 15) {
	return new Promise((res) => {
		if (cb()) {
			res();
			return;
		}

		const intervalId = setInterval(() => {
			if (cb()) {
				res();
				clearInterval(intervalId);
			}
		}, interval);
	});
};

/**
 * @typedef {import('favicons').FaviconStreamOptions} FaviconStreamOptions
 * @typedef {import('favicons').FaviconStream} FaviconStream
 */

/**
 * Wrapper for the `favicons` library.
 * Returns a stream of the generated favicons.
 *
 * @param {FaviconStreamOptions} opts
 * @returns {FaviconStream}
 */
exports.faviconsStream = function faviconsStream(opts) {
	return favicons.stream(opts);
};

/**
 * @typedef {import('vinyl').File} File
 * @typedef {import('through2').TransformFunction} TransformFunction
 * @typedef {import('through2').BufferEncoding} BufferEncoding
 * @typedef {import('through2').TransformCallback} TransformCallback
 */

/**
 * Transforms the given stream of vinyl files to a file content stream
 *
 * @param {File} file
 * @param {BufferEncoding} enc
 * @param {TransformCallback} cb
 */
exports.vinylToBuffer = function vinylToBuffer(file, enc, cb) {
	this.push(file.contents);
	cb();
};

/**
 * Transform the node stream with fs objects to the stream with vinyl objects
 *
 * @param {File} file
 * @param {BufferEncoding} enc
 * @param {TransformCallback} cb
 */
exports.bufferToVinyl = function bufferToVinyl(file, enc, cb) {
	this.push(
		new Vinyl({
			path: file.name,
			contents: file.contents
		})
	);

	cb();
};

/**
 * Patch some assets from the default generation of favicons
 *
 * @param {File} file
 * @param {BufferEncoding} enc
 * @param {TransformCallback} cb
 */
exports.patchFaviconsAssets = function patchFaviconsAssets(file, enc, cb) {
	const
		{manifestName, removeManifestInit} = config.favicons(),
		oldManifestName = 'manifest.webmanifest';

	if (file.name.includes('html')) {
		let
			fileContent = file.contents.toString().split('\n');

		if (removeManifestInit) {
			const
				manifestLineIndex = fileContent.findIndex((line) => line.includes(oldManifestName));

			fileContent.splice(manifestLineIndex, 1);

		} else {
			fileContent = fileContent.map((line) => line.replace(oldManifestName, manifestName));
		}

		file.contents = Buffer.from(fileContent.join('\n'));
	}

	if (file.name === 'manifest.webmanifest') {
		file.name = manifestName;
	}

	this.push(file);
	cb();
};
