/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop, system, p, ModsDecl } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

@component()
export default abstract class iMessage extends iBlock {
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
	 * If true, then will be generated a markup for default messages
	 */
	@prop({type: String, required: false})
	readonly messageHelpers?: boolean;

	/**
	 * Information message store
	 */
	@system({
		replace: false,
		init: (o) => o.sync.link('infoProp')
	})

	infoMsg?: string;

	/**
	 * Error message store
	 */
	@system({
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

		this.waitStatus('ready', () => {
			const
				box = this.block.element('info-box');

			if (box && box.children[0]) {
				box.children[0].innerHTML = this.infoMsg || '';
			}
		});
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

		this.waitStatus('ready', () => {
			const
				box = this.block.element('error-box');

			if (box && box.children[0]) {
				box.children[0].innerHTML = this.errorMsg || '';
			}
		});
	}

	/**
	 * @override
	 * @emits open()
	 * @emits close()
	 */
	protected initModEvents(): void {
		super.initModEvents();

		const
			init = {};

		const createMsgHandler = (type) => (val) => {
			if (!init[type] && this.modsProp && String(this.modsProp[type]) === 'false') {
				return false;
			}

			init[type] = true;
			return Boolean(val);
		};

		this.sync.mod('showInfo', 'infoMsg', createMsgHandler('showInfo'));
		this.sync.mod('showError', 'errorMsg', createMsgHandler('showError'));
	}
}
