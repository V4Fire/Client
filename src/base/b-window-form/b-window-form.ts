/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bWindow, { field, prop, wait } from 'base/b-window/b-window';
import bForm from 'form/b-form/b-form';
import { list2Map } from 'core/helpers';
import { component } from 'core/component';

export * from 'base/b-window/b-window';

@component()
export default class bWindowForm extends bWindow {
	/** @override */
	readonly dbConverter?: Function = list2Map;

	/** @override */
	@prop(String)
	readonly stageProp?: string;

	/** @override */
	@prop({default: (body, isEmpty) => this.stage !== 'remove' && !isEmpty})
	readonly requestFilter: Function | boolean = false;

	/**
	 * If true, then the component won't be reset after closing
	 */
	readonly singleton: boolean = false;

	/**
	 * Initial requested id
	 */
	readonly idProp?: string;

	/**
	 * Method name
	 */
	readonly method?: string;

	/** @override */
	@field((o) => o.createWatchObject('get', {immediate: true}, [['_id', 'id']]))
	protected readonly requestParams: Dictionary = {};

	/**
	 * Requested id
	 */
	@field((o) => o.link('idProp'))
	protected id?: string;

	/**
	 * Form temporary cache
	 */
	@field()
	protected formTmp: Object = {};

	/** @override */
	protected readonly $refs!: {form: bForm};

	/**
	 * Method name
	 */
	protected get methodName(): string | undefined {
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
	protected async initDataListeners(): Promise<void> {
		return;
	}

	/**
	 * Clears the block form
	 * @emits clear()
	 */
	@wait('ready')
	protected async clear(): Promise<boolean> {
		if (await this.$refs.form.clear()) {
			this.emit('clear');
			return true;
		}

		return false;
	}

	/**
	 * Resets the block form
	 * @emits reset()
	 */
	@wait('ready')
	protected async reset(): Promise<boolean> {
		if (await this.$refs.form.reset()) {
			this.emit('reset');
			return true;
		}

		return false;
	}

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	protected async open(stage?: string): Promise<boolean> {
		if (await this.setMod('hidden', false)) {
			this.stage = stage || this.id ? 'edit' : 'new';

			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @override */
	protected async close(): Promise<boolean> {
		const
			res = await super.close();

		if (res && !this.singleton) {
			if (await this.reset() || this.db) {
				this.formTmp = {};
				this.id = undefined;
				this.db = null;
			}
		}

		return res;
	}
}
