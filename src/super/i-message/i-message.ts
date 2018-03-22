/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import KeyCodes from 'core/keyCodes';
import iBlock, { component, prop, field, ModsDecl } from 'super/i-block/i-block';
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
	@field((o) => o.link('infoProp'))
	infoMsg?: string;

	/**
	 * Error message store
	 */
	@field((o) => o.link('errorProp'))
	errorMsg?: string;

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		showInfo: [
			'true',
			['false']
		],

		showError: [
			'true',
			['false']
		],

		opened: [
			'true',
			['false']
		]
	};

	/**
	 * Information message
	 */
	get info(): string | undefined {
		return this.infoMsg;
	}

	/**
	 * Sets a new information message
	 * @param value
	 */
	set info(value: string | undefined) {
		this.infoMsg = value;
	}

	/**
	 * Error message
	 */
	get error(): string | undefined {
		return this.errorMsg;
	}

	/**
	 * Sets a new error message
	 * @param value
	 */
	set error(value: string | undefined) {
		this.errorMsg = value;
	}

	/**
	 * Opens the block
	 * @emits open()
	 */
	async open(): Promise<boolean> {
		if (await this.setMod('opened', true)) {
			this.emit('open');
			return true;
		}

		return false;
	}

	/**
	 * Closes the block
	 * @emits close()
	 */
	async close(): Promise<boolean> {
		if (await this.setMod('opened', false)) {
			this.emit('close');
			return true;
		}

		return false;
	}

	/**
	 * Toggles the block
	 */
	toggle(): Promise<boolean> {
		return this.mods.opened === 'true' ? this.close() : this.open();
	}

	/**
	 * Initializes close helpers
	 */
	protected initCloseHelpers(): void {
		const
			{async: $a, localEvent: $e} = this,
			group = 'closeHelpers';

		const closeHelpers = () => {
			$a.on(document, 'keyup', (e) => {
				if (e.keyCode === KeyCodes.ESC) {
					return this.close();
				}
			}, {group});

			$a.on(document, 'click', (e) => {
				if (!e.target.closest(`.${this.blockId}`)) {
					return this.close();
				}
			}, {group});
		};

		$e.removeAllListeners('block.mod.set.opened.*');
		$e.on('block.mod.set.opened.true', closeHelpers);
		$e.on('block.mod.set.opened.false', () => $a.off({group}));
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();

		this.bindModTo('showInfo', 'infoMsg');
		this.bindModTo('showError', 'errorMsg');

		this.localEvent.on('block.mod.*.valid.*', ({type, value}) => {
			if (type === 'remove' && value === 'false' || type === 'set' && value === 'true') {
				this.error = '';
			}
		});
	}
}
