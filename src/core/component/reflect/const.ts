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
		if (isPropGetter.test(name)) {
			return name.startsWith('@') ? name.slice('@:'.length) : name.slice('on:'.length);
		}

		return name;
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
		return name.endsWith('p') ? name.slice(0, name.length - 'Prop'.length) : isStore.replace(name);
	}
};

export const dsComponentsMods = (() => {
	try {
		return DS_COMPONENTS_MODS;

	} catch {
		return {};
	}
})();

export const isPropGetter = {
	test(name: string): boolean {
		return name.startsWith('@:') || name.startsWith('on:');
	},

	replace(name: string): string {
		if (isPropGetter.test(name)) {
			return name.startsWith('@') ? name.slice('@:'.length) : name.slice('on:'.length);
		}

		return name;
	}
};