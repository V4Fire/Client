/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

'use strict';

exports.attachVIf = function attachVIf(arr, op) {
	const arrJoin = arr.join.bind(arr);

	arr.join = function join() {
		return arrJoin(op);
	};

	return arr;
};

exports.wrapAttrArray = function wrapAttrArray(arr) {
	const arrJoin = arr.join.bind(arr);

	arr.join = function join() {
		if (this.length < 2) {
			return arrJoin.call(this);
		}

		return `[${arrJoin.call(this, ',')}]`;
	};

	return arr;
};
