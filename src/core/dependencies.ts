/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import { EventEmitter2 } from 'eventemitter2';
import { GLOBAL } from 'const/links';

/**
 * Manager of modules
 */
// tslint:disable-next-line
GLOBAL.ModuleDependencies = Object.assign(GLOBAL.ModuleDependencies || {}, {
	/**
	 * Cache for modules
	 */
	cache: Object.create(null),

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
	add(moduleName: string, dependencies: string[]): void {
		let packages = 0;

		function indicator(): void {
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
			style: Function[] = [],
			logic: Function[] = [];

		const
			DEPS = ['js', 'tpl', 'css'].length;

		if (!this.cache[moduleName]) {
			$C(dependencies).forEach((el) => {
				if (this.fileCache[el]) {
					return;
				}

				packages += DEPS;
				this.fileCache[el] = true;

				const
					link = document.createElement('link'),
					cssURL = `${el}$style`;

				if (!PATH[cssURL]) {
					throw new ReferenceError(`Stylesheet "${cssURL}" is not defined`);
				}

				link.href = <string>PATH[cssURL];
				link.rel = 'stylesheet';

				const
					tpl = document.createElement('script'),
					tplURL = `${el}_tpl`;

				if (!PATH[tplURL]) {
					throw new ReferenceError(`Template "${tplURL}" is not defined`);
				}

				tpl.src = <string>PATH[tplURL];
				tpl.async = false;

				const
					script = document.createElement('script');

				if (!PATH[el]) {
					throw new ReferenceError(`JS "${el}" is not defined`);
				}

				script.src = <string>PATH[el];
				script.async = false;

				style.push(() => {
					const
						links = document.getElementsByTagName('link');

					if (links.length) {
						(<any>links[links.length - 1]).after(link);

					} else {
						(<any>document.head).prepend(link);
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
	get(module: string): Promise<string[]> {
		if (this.cache[module]) {
			return this.cache[module];
		}

		const
			script = document.createElement('script'),
			url = `${module}.dependencies`;

		if (!PATH[url]) {
			throw new ReferenceError(`Dependencies "${url}" is not defined`);
		}

		script.src = <string>PATH[`${module}.dependencies`];
		return new Promise((resolve) => {
			this.event.once(`dependencies.${module}`, resolve);
			document.head.appendChild(script);
		});
	}
});
