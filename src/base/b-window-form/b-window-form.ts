/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bForm from 'form/b-form/b-form';
import bWindow, {

	component,
	field,
	prop,
	wait,

	RequestParams,
	RequestFilter,
	Stage,
	ModelMethods

} from 'base/b-window/b-window';

export * from 'base/b-window/b-window';

@component()
export default class bWindowForm<T extends object = Dictionary> extends bWindow<T> {
	/** @override */
	@prop({default: (body, isEmpty) => this.stage !== 'remove' && !isEmpty})
	readonly requestFilter: RequestFilter = false;

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
	readonly method?: ModelMethods;

	/**
	 * Requested id
	 */
	@field((o) => o.sync.link())
	id?: string;

	/**
	 * Model method name
	 */
	get methodName(): CanUndef<ModelMethods> {
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
	@field((o) => o.sync.object('get', {immediate: true}, ['id']))
	protected readonly requestParams!: RequestParams;

	/**
	 * Form temporary cache
	 */
	@field()
	protected formTmp: Dictionary = {};

	/** @override */
	protected readonly $refs!: {form: bForm} & bWindow['$refs'];

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	async open(stage?: Stage): Promise<boolean> {
		return super.open(stage || this.id ? 'edit' : 'new');
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
