'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Store from 'core/store';
import Block from 'super/i-block/modules/block';
import { queue, backQueue } from 'core/render';
import { setLang, lang } from 'core/i18n';
import * as helpers from 'core/helpers';
import * as browser from 'core/const/browser';

const
	Vue = require('vue');

export const
	$$ = new Store();

export default class iPage extends Block {
	/**
	 * Vue template
	 */
	template(): Object {
		return {};
	}

	/**
	 * Vue component
	 */
	component(): Object {
		return {
			data: {
				/**
				 * System language store
				 */
				langStore: lang,

				/**
				 * Block render cursor
				 */
				i: '',

				/**
				 * Counter of async components
				 */
				asyncCounter: 0,

				/**
				 * Cache of child async components
				 */
				asyncComponents: {},

				/**
				 * Cache of child background async components
				 */
				asyncBackComponents: {},

				/**
				 * Base modifiers
				 */
				baseMods: {},

				/**
				 * Additional classes for elements
				 */
				classes: {}
			},

			computed: {
				/**
				 * Data helpers
				 */
				h(): Object {
					return helpers;
				},

				/**
				 * Browser constants
				 */
				b(): Object {
					return browser;
				},

				/**
				 * System language
				 */
				lang: {
					get(): string {
						return this.langStore;
					},

					set(value: string) {
						setLang(this.langStore = value);
					}
				},

				/**
				 * Link to i18n function
				 */
				i18n(): Function {
					return i18n;
				},

				/**
				 * Alias for .i18n
				 */
				t(): Function {
					return this.i18n;
				},

				/**
				 * Link to window.l
				 */
				l(): Function {
					return l;
				},

				/**
				 * Link to console API
				 */
				console(): Function {
					return console;
				},

				/**
				 * Link to window.location
				 */
				location(): Function {
					return location;
				}
			},

			watch: {
				langStore() {
					this.$forceUpdate();
				}
			},

			methods: {
				/**
				 * Returns an object with base block modifiers
				 * @param mods - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
				 */
				provideMods(mods?: Object): Object {
					return mods || {};
				},

				/**
				 * Returns an instance of Vue component by the specified selector
				 * @param selector
				 */
				$(selector: string): ?iBlock {
					const
						$0 = document.query(selector),
						n = $0 && $0.closest('.i-block-helper');

					return n && n.vueComponent;
				},

				/**
				 * Adds a component to the render queue
				 * @param id - task id
				 */
				regAsyncComponent(id: string): string {
					if (!this.asyncComponents[id]) {
						queue.add(() => {
							this.asyncCounter++;
							this.$set(this.asyncComponents, id, true);
						});
					}

					return id;
				},

				/**
				 * Adds a component to the background render queue
				 * @param id - task id
				 */
				regAsyncBackComponent(id: string): string {
					if (!this.regAsyncBackComponent[id]) {
						backQueue.add(() => {
							this.asyncCounter++;
							this.$set(this.regAsyncBackComponent, id, true);
						});
					}

					return id;
				}
			}
		};
	}

	/**
	 * @override
	 * @param [params] - page params
	 */
	constructor(params?: Object) {
		params = {data: {}, ...params};
		super(params);

		const comp = {
			data: {},
			...this.component(),
			...this.template(),
			el: this.node
		};

		if (params.data) {
			Object.assign(comp.data, params.data);
		}

		this.model = new Vue(comp);
		this.node = this.model.$el.parentNode;

		Object.assign(this.model, {
			async: this.async,
			block: this,
			localEvent: this.localEvent,
			blockId: this.id
		});
	}
}
