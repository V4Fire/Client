/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { field, component, prop, watch, hook, ModsDecl } from 'super/i-data/i-data';
import keyCodes from 'core/keyCodes';
import { RequestError } from 'core/data';

export * from 'super/i-data/i-data';

@component()
export default class bWindow extends iData {
	/**
	 * Initial window title
	 */
	@prop(String)
	readonly titleProp?: string;

	/**
	 * Map of window titles ({stage: title})
	 */
	@prop(Object)
	readonly stageTitles: Dictionary<string> = {};

	/** @inheritDoc */
	static mods: ModsDecl = {
		hidden: [
			['true'],
			'false'
		]
	};

	/**
	 * Window title store
	 */
	@field((o) => o.link('titleProp'))
	protected titleStore?: string;

	/** @override */
	set error(value: string) {
		if (value) {
			this.stage = 'error';
		}

		this.errorMsg = value;
	}

	/**
	 * Window title
	 */
	protected get title(): string {
		return this.titleStore && this.stage ? this.t(this.stageTitles[this.stage]) : '';
	}

	/**
	 * Sets the specified window title
	 */
	protected set title(value: string) {
		this.titleStore = value;
	}

	/**
	 * Clears asyncs by group on stage change
	 *
	 * @param {string} value
	 * @param {string} oldValue
	 */
	@watch({field: 'stage'})
	protected clearOnStageChange(value: string, oldValue: string): void {
		this.async.clearAll({group: `stage.${oldValue}`});
	}

	/**
	 * Handler: error
	 * @param err
	 */
	protected onError(err: RequestError): void {
		this.error = this.getDefaultErrorText(err);
	}

	/**
	 * @override
	 * @param [stage] - window stage
	 */
	protected async open(stage?: string): Promise<boolean> {
		if (await this.setMod('hidden', false)) {
			await this.nextTick();
			this.emit('open');
			return true;
		}

		return false;
	}

	/** @override */
	protected async close(): Promise<boolean> {
		if (await this.setMod('hidden', true)) {
			this.emit('close');
			return true;
		}

		return false;
	}

	/** @override */
	protected initCloseHelpers(): void {
		const
			{async: $a, localEvent: $e} = this,
			group = 'closeHelpers';

		const closeHelpers = () => {
			$a.on(document, 'keyup', (e) => e.keyCode === keyCodes.ESC && this.close(), {group});

			$a.on(
				document,
				'mousedown touchstart',
				(e) => e.target.matches(this.block.getElSelector('wrapper')) && this.close(), {group});
		};

		$e.removeAllListeners('block.mod.*.hidden.*');
		$e.on('block.mod.remove.hidden.*', closeHelpers);
		$e.on('block.mod.set.hidden.false', closeHelpers);
		$e.on('block.mod.set.hidden.true', () => $a.off({group}));
	}

	/**
	 * Call initializing close helpers events for the window
	 */
	@hook('created')
	protected initializeCloseHelpers(): void {
		this.initCloseHelpers();
	}

	/**
	 * Adds window to start of the page
	 */
	@hook('mounted')
	protected prependElToBody(): void {
		(<any>document.body).prepend(this.$el);
	}
}
