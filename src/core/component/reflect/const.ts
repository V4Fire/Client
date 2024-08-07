/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const isPropGetter = {
	test(name: string): boolean {
		return name.startsWith('@:') || name.startsWith('on:');
	},

	replace(name: string): string {
		return name.startsWith('@') ? name.slice('@:'.length) : name.slice('on:'.length);
	}
};

export const isPrivateField = {
	test(name: string): boolean {
		return name.startsWith('[[');
	},

	replace(name: string): string {
		return name.slice('[['.length, name.length - ']]'.length);
	}
};

export const isStore = {
	test(name: string): boolean {
		return name.endsWith('Store');
	},

	replace(name: string): string {
		return name.slice(0, name.length - 'Store'.length);
	}
};

export const isBinding = {
	test(name: string): boolean {
		return isStore.test(name) || name.endsWith('Prop');
	},

	replace(name: string): string {
		return name.startsWith('p') ? name.slice('Prop'.length) : name.slice('Store'.length);
	}
};

export const dsComponentsMods = (() => {
	try {
		return DS_COMPONENTS_MODS;

	} catch {
		return {};
	}
})();
