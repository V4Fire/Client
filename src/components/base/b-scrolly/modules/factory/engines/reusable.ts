/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import type bScrolly from 'components/base/b-scrolly/b-scrolly';
import type { ComponentItem } from 'components/base/b-scrolly/interface';
import type { VNode } from 'components/base/b-scrolly/b-scrolly';

export class ReusableRenderEngine {
	/**
	 * Движок который выполняет отрисовку узлов
	 */
	protected vueInstance?: Vue;

	protected vNodesToRender?: VNode[];

	reset(): void {
		this.vueInstance?.$destroy();
	}

	render(ctx: bScrolly, items: ComponentItem[]): HTMLElement[] {
		 this.vNodesToRender = items.map((item) => ctx.unsafe.$createElement(item.item, {
			attrs: {
				'v-attrs': item.props
			}
		}));

		if (this.vueInstance) {
			this.vueInstance.$forceUpdate();
		}

		this.vueInstance = new Vue({
			render: (c) => c('div', this.vNodesToRender)
		});

		Object.set(this.vueInstance, '$root', Object.create(ctx.$root));
		Object.set(this.vueInstance, '$root.$remoteParent', ctx);
		Object.set(this.vueInstance, '$root.unsafe', this.vueInstance.$root);

		const el = document.createElement('div');
		this.vueInstance.$mount(el);

		return <HTMLElement[]>Array.from(el.firstChild?.firstChild?.childNodes ?? []);
	}
}
