/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import $C = require('collection.js');
import ion = require('ion-sound');

import config from 'config';
import symbolGenerator from 'core/symbol';
import iData, { prop, component } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

ion.sound({
	sounds: [
		{name: 'door_bell'}
	],

	volume: 1,
	path: `/dist/client/${PATH.sounds}/`,
	preload: true
});

export interface Message<T extends Dictionary = Dictionary> extends Dictionary {
	instance: string;
	type: string;
	data: T;
}

export interface Rule<T = unknown> {
	onShow?: Function;
	title?(data: T): string;
	body(data: T): string;
	test?(data: T): boolean;
}

export type Rules<T = unknown> = Dictionary<
	Dictionary<Rule<T>>
>;

export const
	$$ = symbolGenerator();

@component()
export default class bNotifier<T extends Message = Message> extends iData<T> {
	/** @override */
	readonly dataProviderParams: Dictionary = {listenAllEvents: true};

	/**
	 * Default project title
	 */
	@prop(String)
	readonly title: string = config.appName || '';

	/**
	 * Notify rules
	 */
	@prop(Object)
	readonly rules: Rules<T> = {};

	/**
	 * Notify sound
	 */
	@prop(String)
	readonly sound: string = 'door_bell';

	/**
	 * If false, the helper tooltip won't be displayed
	 */
	readonly showTooltip: boolean = true;

	/**
	 * Notification permission
	 */
	get permission(): NotificationPermission {
		try {
			// @ts-ignore
			return Notification.permission;

		} catch {
			return 'denied';
		}
	}

	/**
	 * Requests for notifications
	 */
	async requestPermissions(): Promise<void> {
		if (await Notification.requestPermission()) {
			await this.setMod('hidden', true);
		}
	}

	/**
	 * Sends notifications
	 * @param data
	 */
	notify(data: T): void {
		if (!data.instance) {
			return;
		}

		try {
			// @ts-ignore
			if (!Notification.permission) {
				return;
			}

			const
				rule = <Rule<T>>$C<any>(this.rules).get([data.instance, data.type]);

			if (!rule || rule.test && !rule.test(data)) {
				return;
			}

			const
				that = this,
				{onShow} = rule;

			const r = {
				...rule,
				silent: true,
				onshow(): void {
					if (that.sound) {
						ion.sound.play(that.sound);
					}

					onShow && onShow.apply(this, arguments);
				}
			};

			Object.assign(
				new Notification(r.title ? r.title(data) : this.title, {
					tag: data.instance,
					body: r.body(data),
					icon: '/assets/favicons/favicon.ico',
					...Object.reject(rule, /^(on|body$)/)
				}),

				$C(Object.select(rule, /^on/)).map((fn) => (e) => fn(e, data))
			);

		} catch {}
	}

	/** @override */
	protected convertStateToStorage(): Dictionary {
		return {
			'mods.hidden': this.mods.opened
		};
	}

	/** @override */
	protected async onAddData(data: unknown): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}

	/** @override */
	protected async onUpdData(data: unknown): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}

	/** @override */
	protected async onDelData(data: unknown): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}
}
