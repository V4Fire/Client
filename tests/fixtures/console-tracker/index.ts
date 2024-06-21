/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ConsoleMessage, Page } from '@playwright/test';
import type { MessageFilters } from 'tests/fixtures/console-tracker/interface';

export default class ConsoleTracker {
	/**
	 * Playwright page
	 */
	protected page: Page;

	/**
	 * Filters used to process console messages.
	 * Each filter key is a match condition; value is a serializer function for messages.
	 */
	protected messageFilters: MessageFilters;

	/**
	 * Collected and possibly modified console messages
	 */
	protected messages: string[] = [];

	/**
	 * Promises that handle the serialization process of individual messages
	 */
	protected serializePromises: Array<Promise<void>> = [];

	/**
	 * Event handler for page console events.
	 * It is triggered when a new console message appears.
	 *
	 * @param msg - the console message event object
	 */
	protected listener: (msg: ConsoleMessage) => void;

	/**
	 * Creates a new instance of the ConsoleTracker class
	 *
	 * @param page - the webpage to track console messages on
	 * @param [messageFilters] - filters for processing specific console messages
	 */
	constructor(page: Page, messageFilters?: MessageFilters) {
		this.page = page;
		this.messageFilters = messageFilters ?? {};

		this.listener = (msg) => {
			const promise = this.serializeMessage(msg)
				.then((msgText) => {
					if (msgText != null) {
						this.messages.push(msgText);
					}
				})
				.catch((error) => {
					this.messages.push(`Failed to serialize console message, reason: ${error.message}`);
				});

			this.serializePromises.push(promise);
		};

		this.page.on('console', this.listener);
	}

	/**
	 * Returns the array of console messages after processing serialization
	 */
	async getMessages(): Promise<string[]> {
		// Waits for all messages to be serialized
		await Promise.allSettled(this.serializePromises);

		return this.messages;
	}

	/**
	 * Replaces previous message filters with given
	 * @param msgFilters
	 */
	setMessageFilters(msgFilters: MessageFilters): void {
		this.messageFilters = msgFilters;
	}

	/**
	 * Sets log env pattern
	 * @param pattern
	 */
	async setLogPattern(pattern: string | RegExp): Promise<void> {
		await this.page.evaluate((pattern) => {
			globalThis.setEnv('log', {patterns: [pattern]});
		}, pattern);
	}

	/**
	 * Clears the console message listener
	 */
	clear(): void {
		this.page.off('console', this.listener);
	}

	/**
	 * Determines the string that needs to be saved or returns `null`
	 * @param msg - the console message to process
	 */
	protected async serializeMessage(msg: ConsoleMessage): Promise<CanNull<string>> {
		const msgText = msg.text().toLowerCase();

		for (const filter of Object.keys(this.messageFilters)) {
			const serializer = this.messageFilters[filter];

			if (msgText.includes(filter.toLowerCase())) {
				return (await serializer?.(msg)) ?? msgText;
			}
		}

		return null;
	}
}
