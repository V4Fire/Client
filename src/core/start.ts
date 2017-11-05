/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { rootComponents } from 'core/component';

document.addEventListener('DOMContentLoaded', () => {
	const
		nodes = document.querySelectorAll('[data-init-block]');

	for (let i = 0; i < nodes.length; i++) {
		const
			el = <HTMLElement>nodes[i],
			blocks = el.dataset.initBlock;

		if (!blocks) {
			throw new Error('Invalid root block declaration');
		}

		const
			names = blocks.split(',');

		for (let i = 0; i < names.length; i++) {
			const
				name = names[i].trim(),
				p = `${name}-params`.camelize(false);

			if (rootComponents[name]) {
				if (!el.children.length) {
					el.innerHTML = '<div></div>';
				}

				// tslint:disable-next-line
				new rootComponents[name]({node: el.children[0], ...el.dataset[p] && Object.parse(el.dataset[p])});
			}

			delete el.dataset[p];
		}

		delete el.dataset.initBlock;
	}

	READY_STATE++;
});
