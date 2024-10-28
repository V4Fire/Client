/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iAccess from 'components/traits/i-access/i-access';
import iVisible from 'components/traits/i-visible/i-visible';

import { component, ModEvent } from 'components/super/i-data/i-data';

import iInputFields from 'components/super/i-input/fields';

@component({partial: 'iInput'})
export default abstract class iInputHandlers extends iInputFields {
	protected override initRemoteData(): CanUndef<CanPromise<unknown | Dictionary>> {
		if (this.db == null) {
			return;
		}

		const
			val = this.convertDBToComponent(this.db);

		if (Object.isDictionary(val)) {
			return Promise.all(this.state.set(val)).then(() => val);
		}

		this.value = val;
		return val;
	}

	protected override initModEvents(): void {
		super.initModEvents();

		iAccess.initModEvents(this);
		iVisible.initModEvents(this);

		this.localEmitter.on('block.mod.*.valid.*', ({type, value}: ModEvent) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = undefined;
			}
		});

		this.localEmitter.on('block.mod.*.disabled.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const
				{input} = this.$refs;

			if (input != null) {
				input.disabled = e.value !== 'false' && e.type !== 'remove';
			}
		}));

		this.localEmitter.on('block.mod.*.focused.*', (e: ModEvent) => this.waitComponentStatus('ready', () => {
			const
				{input} = this.$refs;

			if (input == null) {
				return;
			}

			if (e.value !== 'false' && e.type !== 'remove') {
				input.focus();

			} else {
				input.blur();
			}
		}));

		const
			messageInitMap = Object.createDict();

		const createMessageHandler = (type: string) => (val: unknown) => {
			if (messageInitMap[type] == null && this.modsProp != null && String(this.modsProp[type]) === 'false') {
				return false;
			}

			messageInitMap[type] = true;
			return Boolean(val);
		};

		this.sync.mod('showInfo', 'infoStore', createMessageHandler('showInfo'));
		this.sync.mod('showError', 'errorStore', createMessageHandler('showError'));
	}

	/**
	 * Handler: the component in focus
	 */
	protected onFocus(): void {
		void this.setMod('focused', true);
	}

	/**
	 * Handler: the component lost the focus
	 */
	protected onBlur(): void {
		void this.setMod('focused', false);
	}

	/**
	 * Handler: the value of the component has changed
	 *
	 * @param value
	 * @param oldValue
	 * @emits `change(value: this['Value'])`
	 */
	protected onValueChange(value: this['Value'], oldValue: CanUndef<this['Value']>): void {
		this.prevValue = oldValue;

		if (value !== oldValue || value != null && typeof value === 'object') {
			this.emit('change', this.value);
			this.$emit('update:modelValue', this.value);
		}
	}
}
