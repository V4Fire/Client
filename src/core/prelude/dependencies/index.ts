/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { deprecate } from 'core/functools';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

/**
 * Adds the "nonce" attribute to the specified element if the "GLOBAL_NONCE" variable is defined
 * (support for Content Security Policy)
 *
 * @param el
 */
function addNonceAttribute(el: Element): void {
	if (typeof GLOBAL_NONCE === 'string') {
		el.setAttribute('nonce', GLOBAL_NONCE);
	}
}

const
	API = globalThis[MODULE_DEPENDENCIES] ?? {fileCache: Object.createDict()};

/**
 * Manager of modules
 */
export default globalThis[MODULE_DEPENDENCIES] = Object.mixin({withAccessors: true}, API, {
	/**
	 * Cache of modules
	 */
	cache: Object.createDict(),

	/**
	 * Event emitter to broadcast module events
	 */
	emitter: new EventEmitter({maxListeners: 100, newListener: false}),

	/**
	 * @deprecated
	 * @see emitter
	 */
	get event(): EventEmitter {
		deprecate({name: 'event', type: 'accessor', renamedTo: 'emitter'});
		return this.emitter;
	},

	/**
	 * Adds new dependencies to the cache
	 *
	 * @param moduleName
	 * @param dependencies - list of dependencies
	 */
	add(moduleName: string, dependencies: string[]): void {
		const
			{head} = document;

		if (!Object.isTruly(head)) {
			return;
		}

		let
			packages = 0;

		const indicator = () => {
			const blob = new Blob(
				[`${MODULE_DEPENDENCIES}.emitter.emit('component.${moduleName}.loading', {packages: ${packages}})`],
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

		if (this.cache[moduleName] == null) {
			for (let i = 0; i < dependencies.length; i++) {
				const
					el = dependencies[i];

				if (this.fileCache[el] === true) {
					continue;
				}

				packages += DEPS;
				this.fileCache[el] = true;

				const
					link = document.createElement('link'),
					cssURL = `${el}$style`;

				if (PATH[cssURL] == null) {
					throw new ReferenceError(`Stylesheet "${cssURL}" is not defined`);
				}

				link.href = <string>PATH[cssURL];
				link.rel = 'stylesheet';
				addNonceAttribute(link);

				const
					tpl = document.createElement('script'),
					tplURL = `${el}_tpl`;

				if (PATH[tplURL] == null) {
					throw new ReferenceError(`Template "${tplURL}" is not defined`);
				}

				tpl.src = <string>PATH[tplURL];
				tpl.async = false;
				addNonceAttribute(tpl);

				const
					script = document.createElement('script');

				if (PATH[el] == null) {
					throw new ReferenceError(`JS "${el}" is not defined`);
				}

				script.src = <string>PATH[el];
				script.async = false;
				addNonceAttribute(script);

				style.push(() => {
					const
						links = document.getElementsByTagName('link');

					if (links.length > 0) {
						const lastLink = links[links.length - 1];
						(<HTMLElement>lastLink.parentElement).insertBefore(link, lastLink.nextSibling);

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
		this.emitter.emit(`dependencies.${moduleName}`, {dependencies, moduleName, packages});
	},

	/**
	 * Returns a list of dependencies for the specified module
	 * @param module
	 */
	get(module: string): CanPromise<string[]> {
		if (this.cache[module] != null) {
			return this.cache[module];
		}

		const
			{head} = document;

		if (!Object.isTruly(head)) {
			return [];
		}

		const
			script = document.createElement('script'),
			url = `${module}.dependencies`;

		if (PATH[url] == null) {
			throw new ReferenceError(`Dependencies for "${url}" are not defined`);
		}

		script.src = String(PATH[`${module}.dependencies`]);
		addNonceAttribute(script);

		return new Promise((resolve) => {
			this.emitter.once(`dependencies.${module}`, resolve);
			head.appendChild(script);
		});
	}
});
