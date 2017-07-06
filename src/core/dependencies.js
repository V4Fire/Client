'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	$C = require('collection.js'),
	EventEmitter2 = require('eventemitter2').EventEmitter2;

/**
 * Manager of modules
 */
window.ModuleDependencies = Object.assign(window.ModuleDependencies, {
	/**
	 * Cache for modules
	 */
	cache: {},

	/**
	 * Event emitter instance
	 */
	event: new EventEmitter2({maxListeners: 100, wildcard: true}),

	/**
	 * Adds new dependencies to the cache
	 *
	 * @param moduleName
	 * @param dependencies
	 */
	add(moduleName: string, dependencies: Array<string>) {
		let packages = 0;

		function indicator() {
			const blob = new Blob(
				[`ModuleDependencies.event.emit('component.${moduleName}.loading', {packages: ${packages}})`],
				{type: 'application/javascript'}
			);

			const script = document.createElement('script');
			script.src = URL.createObjectURL(blob);
			script.async = false;
			document.head.appendChild(script);
		}

		const
			style = [],
			logic = [];

		if (!this.cache[moduleName]) {
			$C(dependencies).forEach((el) => {
				if (this.fileCache[el]) {
					return;
				}

				packages += 3;
				this.fileCache[el] = true;

				const link = document.createElement('link');
				link.href = PATH[`${el}$style`];
				link.rel = 'stylesheet';

				const tpl = document.createElement('script');
				tpl.src = PATH[`${el}_tpl`];
				tpl.async = false;

				const script = document.createElement('script');
				script.src = PATH[el];
				script.async = false;

				style.push(() => {
					const
						links = document.getElementsByTagName('link');

					if (links.length) {
						links[links.length - 1].after(link);

					} else {
						document.head.prepend(link);
					}
				});

				logic.push(() => {
					indicator();
					document.head.appendChild(tpl);
					indicator();
					document.head.appendChild(script);
					indicator();
				});
			});

			$C(style).forEach((fn) => fn());
			$C(logic).forEach((fn) => fn());
		}

		this.cache[moduleName] = dependencies;
		this.event.emit(`dependencies.${moduleName}`, {dependencies, moduleName, packages});
	},

	/**
	 * Get dependencies for the specified module
	 * @param module
	 */
	get(module: string): Promise<Array<string>> {
		if (this.cache[module]) {
			return this.cache[module];
		}

		const script = document.createElement('script');
		script.src = PATH[`${module}.dependencies`];

		return new Promise((resolve) => {
			this.event.once(`dependencies.${module}`, resolve);
			document.head.appendChild(script);
		});
	}
});
