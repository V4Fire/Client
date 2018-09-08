/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

type libs = (...names: string[]) => {libs: dependencies};
type dependencies = (...names: string[]) => {dependencies: libs};

declare function package(name: string): {
	dependencies: libs;
	libs: dependencies;

	mixin(): {
		dependencies: libs;
		libs: dependencies;
	};

	extends(name: string): {
		dependencies: libs;
		libs: dependencies;
	};
};
