/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bWindow, { component, field, prop, wait } from 'base/b-window/b-window';
import bForm from 'form/b-form/b-form';
export * from 'base/b-window/b-window';

@component()
export default class bWindowForm<T extends Dictionary = Dictionary> extends bWindow<T> {
	/** @override */
	@prop({default: (body, isEmpty) => this.stage !== 'remove' && !isEmpty})
	readonly requestFilter: Function | boolean = false;

	/**
	 * If true, then the component won't be reset after closing
	 */
	@prop(Boolean)
	readonly singleton: boolean = false;

	/**
	 * Initial requested id
	 */
	@prop({type: String, required: false})
	readonly idProp?: string;

	/**
	 * Method name
	 */
	@prop({type: String, required: false})
	readonly method?: string;

	/**
	 * Requested id
	 */
	@field((o) => o.link('idProp'))
	id?: string;

	/**
	 * Method name
	 */
	get methodName(): string | undefined {
		let m = this.method;

		if (!m) {
			switch (this.stage) {
				case 'edit':
					if (this.id) {
						m = 'upd';
					}

					break;

				case 'remove':
					m = 'del';
					break;

				default:
					m = 'add';
			}
		}

		return m;
	}

	/** @override */
	@field((o) => o.createWatchObject('get', {immediate: true}, [['_id', 'id']]))
	protected readonly requestParams: Dictionary = {};

	/**
	 * Form temporary cache
	 */
	@field()
	protected formTmp: Dictionary = {};

	/** @override */
	protected readonly $refs!: {form: bForm};

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	async open(stage?: string): Promise<boolean> {
		if (await this.setMod('hidden', false)) {
			this.stage = stage || this.id ? 'edit' : 'new';

			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @override */
	async close(): Promise<boolean> {
		const
			res = await super.close();

		if (res && !this.singleton) {
			if (await this.reset() || this.db) {
				this.formTmp = {};
				this.id = undefined;
				this.db = undefined;
			}
		}

		return res;
	}

	/**
	 * Clears the component form
	 * @emits clear()
	 */
	@wait('ready')
	async clear(): Promise<boolean> {
		if (await this.$refs.form.clear()) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/**
	 * Resets the component form
	 * @emits reset()
	 */
	@wait('ready')
	async reset(): Promise<boolean> {
		if (await this.$refs.form.reset()) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/** @override */
	protected async initDataListeners(): Promise<void> {
		return;
	}
}
