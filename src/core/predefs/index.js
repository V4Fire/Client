'use strict';

/* eslint-disable no-unused-vars */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

type $$d = (...name: string) => {libs: $$l};
type $$l = (...name: string) => {dependencies: $$d};

/**
 * Defines a module
 * @param name - module name
 */
global.package = function (name: string): {
	mixin(): {
		dependencies: $$d,
		libs: $$l
	},

	extends(name: string): {
		dependencies: $$d,
		libs: $$l
	},

	dependencies: $$d,
	libs: $$l

} {
	function dependencies(...name) {
		return {libs};
	}

	function libs(...lib) {
		return {dependencies};
	}

	return {
		libs,
		dependencies,
		extends(name) {
			return {dependencies, libs};
		},

		mixin() {
			return {dependencies, libs};
		}
	};
};
