'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

exports.attachVIf = function (arr, op) {
	const
		join = arr.join;

	arr.join = function () {
		return join.call(this, op);
	};

	return arr;
};

exports.wrapAttrArray = function (arr) {
	const
		join = arr.join;

	arr.join = function () {
		if (this.length < 2) {
			return join.call(this);
		}

		return `[${join.call(this, ',')}]`;
	};

	return arr;
};
