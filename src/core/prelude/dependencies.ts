/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { EventEmitter2 as EventEmitter } from 'eventemitter2';
import { GLOBAL } from 'core/env';

/**
 * Adds an attribute "nonce" to the specified element if defined "GLOBAL_NONCE" variable
 * (support Content Security Policy)
 *
 * @param el
 */
function addNonceAttribute(el: Element): void {
	if (typeof GLOBAL_NONCE === 'string') {
		el.setAttribute('nonce', GLOBAL_NONCE);
	}
}

/**
 * Manager of modules
 */
// tslint:disable-next-line:prefer-object-spread
export default GLOBAL[MODULE_DEPENDENCIES] = Object.assign(GLOBAL[MODULE_DEPENDENCIES] || {}, {
	/**
	 * Cache for modules
	 */
	cache: Object.createDict(),

	/**
	 * Event emitter instance
	 */
	event: new EventEmitter({maxListeners: 100, newListener: false}),

	/**
	 * Adds new dependencies to the cache
	 *
	 * @param moduleName
	 * @param dependencies
	 */
	add(moduleName: string, dependencies: string[]): void {
		const
			{head} = document;

		if (!head) {
			return;
		}

		let
			packages = 0;

		const indicator = () => {
			const blob = new Blob(
				[`${MODULE_DEPENDENCIES}.event.emit('component.${moduleName}.loading', {packages: ${packages}})`],
				{type: 'application/javascript'}
			);

			const
				script = document.createElement('script');

			script.src = URL.createObjectURL(blob);
			script.async = false;
			addNonceAttribute(script);

			head.appendChild(script);
		};

		const
			style: Function[] = [],
			logic: Function[] = [];

		const
			DEPS = ['js', 'tpl', 'css'].length;

		if (!this.cache[moduleName]) {
			for (let i = 0; i < dependencies.length; i++) {
				const
					el = dependencies[i];

				if (this.fileCache[el]) {
					continue;
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
				addNonceAttribute(link);

				const
					tpl = document.createElement('script'),
					tplURL = `${el}_tpl`;

				if (!PATH[tplURL]) {
					throw new ReferenceError(`Template "${tplURL}" is not defined`);
				}

				tpl.src = <string>PATH[tplURL];
				tpl.async = false;
				addNonceAttribute(tpl);

				const
					script = document.createElement('script');

				if (!PATH[el]) {
					throw new ReferenceError(`JS "${el}" is not defined`);
				}

				script.src = <string>PATH[el];
				script.async = false;
				addNonceAttribute(script);

				style.push(() => {
					const
						links = document.getElementsByTagName('link');

					if (links.length) {
						links[links.length - 1].after(link);

					} else {
						head.insertAdjacentElement('beforeend', link);
					}
				});

				logic.push(() => {
					indicator();
					head.appendChild(tpl);
					indicator();
					head.appendChild(script);
					indicator();
				});
			}

			for (let i = 0; i < style.length; i++) {
				style[i]();
			}

			for (let i = 0; i < logic.length; i++) {
				logic[i]();
			}
		}

		this.cache[moduleName] = dependencies;
		this.event.emit(`dependencies.${moduleName}`, {dependencies, moduleName, packages});
	},

	/**
	 * Get dependencies for the specified module
	 * @param module
	 */
	get(module: string): CanPromise<string[]> {
		if (this.cache[module]) {
			return this.cache[module];
		}

		const
			{head} = document;

		if (!head) {
			return [];
		}

		const
			script = document.createElement('script'),
			url = `${module}.dependencies`;

		if (!PATH[url]) {
			throw new ReferenceError(`Dependencies "${url}" is not defined`);
		}

		script.src = <string>PATH[`${module}.dependencies`];
		addNonceAttribute(script);

		return new Promise((resolve) => {
			this.event.once(`dependencies.${module}`, resolve);
			head.appendChild(script);
		});
	}
});
