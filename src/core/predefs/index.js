'use strict';

/* eslint-disable no-unused-vars */

/*!
 * TravelChat Client
 * https://github.com/Travelbanda/TravelChat
 *
 * Released under the FSFUL license
 * https://github.com/Travelbanda/TravelChat/blob/master/LICENSE
 */

type $$d = (...name: string) => {libs: $$l};
type $$l = (...name: string) => {dependencies: $$d};

/**
 * Defines a module
 * @param name - module name
 */
global.package = function (name: string): {
	mixin(): void,
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

		}
	};
};
