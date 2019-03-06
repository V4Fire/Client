/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop, field, p, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component()
export default class iMessage extends iBlock {
	/**
	 * Initial information message
	 */
	@prop({type: String, required: false})
	readonly infoProp?: string;

	/**
	 * Initial error message
	 */
	@prop({type: String, required: false})
	readonly errorProp?: string;

	/**
	 * Information message store
	 */
	@field({
		replace: false,
		init: (o) => o.sync.link('infoProp')
	})

	infoMsg?: string;

	/**
	 * Error message store
	 */
	@field({
		replace: false,
		init: (o) => o.sync.link('errorProp')
	})

	errorMsg?: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		showInfo: [
			'true',
			'false'
		],

		showError: [
			'true',
			'false'
		]
	};

	/**
	 * Information message
	 */
	@p({replace: false})
	get info(): CanUndef<string> {
		return this.infoMsg;
	}

	/**
	 * Sets a new information message
	 * @param value
	 */
	set info(value: CanUndef<string>) {
		this.infoMsg = value;
	}

	/**
	 * Error message
	 */
	@p({replace: false})
	get error(): CanUndef<string> {
		return this.errorMsg;
	}

	/**
	 * Sets a new error message
	 * @param value
	 */
	set error(value: CanUndef<string>) {
		this.errorMsg = value;
	}

	/**
	 * @override
	 * @emits open()
	 * @emits close()
	 */
	protected initModEvents(): void {
		super.initModEvents();
		this.sync.mod('showInfo', 'infoMsg');
		this.sync.mod('showError', 'errorMsg');
	}
}
