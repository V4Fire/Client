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

export interface Message<T extends Dictionary = Dictionary> {
	instance: string;
	type: string;
	data: T;
}

export const
	$$ = symbolGenerator();

@component()
export default class bNotifier<T extends Dictionary = Message> extends iData<T> {
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
	readonly rules: Dictionary = {};

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

		} catch (_) {
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

			let
				rule = $C(this.rules).get([data.instance, data.type]);

			if (!rule || rule.test && !rule.test(data)) {
				return;
			}

			const
				{onshow} = rule;

			rule = {...rule, silent: true};
			rule.onshow = function (): void {
				ion.sound.play('door_bell');
				onshow && onshow.apply(this, arguments);
			};

			Object.assign(
				new Notification(rule.title ? rule.title(data) : this.title, <any>{
					tag: data.instance,
					body: rule.body(data),
					icon: '/assets/favicons/favicon.ico',
					...Object.reject(rule, /^(on|body$)/)
				}),

				$C(Object.select(rule, /^on/)).map((fn) => (e) => fn(e, data))
			);

		} catch (_) {}
	}

	/** @override */
	protected convertStateToStorage(): Dictionary {
		return {
			'mods.hidden': this.mods.opened
		};
	}

	/** @override */
	protected async onAddData(data: any): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}

	/** @override */
	protected async onUpdData(data: any): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}

	/** @override */
	protected async onDelData(data: any): Promise<void> {
		if (data != null) {
			await this.notify(this.convertDataToDB(data));
		}
	}
}
