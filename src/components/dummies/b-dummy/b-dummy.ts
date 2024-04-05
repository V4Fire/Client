/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/dummies/b-dummy/README.md]]
 * @packageDocumentation
 */

import type { VNode } from 'core/component/engines';

import type iBlock from 'components/super/i-block/i-block';
import iData, { component, field } from 'components/super/i-data/i-data';
import type bRemoteProvider from 'components/base/b-remote-provider/b-remote-provider';

export * from 'components/super/i-data/i-data';

@component({
	functional: {
		functional: true
	}
})

class bDummy extends iData {
	/**
	 * Name of the test component
	 */
	@field()
	testComponent?: string;

	/**
	 * Attributes for the test component
	 */
	@field()
	testComponentAttrs: Dictionary = {};

	/**
	 * Slots for the test component
	 */
	@field()
	testComponentSlots?: CanArray<VNode>;

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
		remoteProvider: bRemoteProvider;
	};

	protected mounted(): void {
		this.$refs.remoteProvider.requestParams.get = {id: 1};

		this.globalEmitter.on('reset.load.silence', () => {
			let {id} = <{id: number}>this.$refs.remoteProvider.requestParams.get;

			this.$refs.remoteProvider.requestParams.get = {id: ++id <= 2 ? id : 1};
		});
	}
}

export default bDummy;
