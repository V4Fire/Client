/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import Utils from 'tests/helpers/utils';

import type * as SessionAPI from 'core/session';

test.describe('core/session', () => {
	let sessionAPI: JSHandle<typeof SessionAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		sessionAPI = await Utils.import(page, 'core/session');
	});

	test.describe('`set`', () => {
		test('should store session with the specified parameters', async () => {
			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

			const res = await sessionAPI.evaluate((ctx) => ctx.get());
			test.expect(res).toEqual({auth: 'authToken', params: {someParam: 1}});
		});

		test('should emit a `set` event with the parameters of the specified session', async () => {
			const
				eventPr = sessionAPI.evaluate(({emitter}) => new Promise((res) => emitter.on('set', res)));

			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));
			await test.expect(eventPr).toBeResolvedTo({auth: 'authToken', params: {someParam: 1}});
		});
	});

	test.describe('`get`', () => {
		test('should return session data if the session was initialized', async () => {
			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

			const res = await sessionAPI.evaluate((ctx) => ctx.get());
			test.expect(res).toEqual({auth: 'authToken', params: {someParam: 1}});
		});

		test('should return `undefined` if the session was not initialized', async () => {
			const res = await sessionAPI.evaluate((ctx) => ctx.get());
			test.expect(res).toEqual({auth: undefined, params: undefined});
		});
	});

	test.describe('`clear`', () => {
		test('should clear the stored session', async () => {
			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));
			await sessionAPI.evaluate((ctx) => ctx.clear());

			const res = await sessionAPI.evaluate((ctx) => ctx.get());
			test.expect(res).toEqual({auth: undefined, params: undefined});
		});

		test('should emit a `clear` event', async () => {
			const
				eventPr = sessionAPI.evaluate(({emitter}) => new Promise((res) => emitter.on('clear', res)));

			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));
			await sessionAPI.evaluate((ctx) => ctx.clear());

			await test.expect(eventPr).toBeResolved();
		});
	});

	test.describe('`match`', () => {
		test.beforeEach(() => sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1})));

		test('should return `true` if the current session and the provided session are the same', async () => {
			const res = await sessionAPI.evaluate((ctx) => ctx.match('authToken', {someParam: 1}));
			test.expect(res).toBe(true);
		});

		test('should return `false` if the current session and the provided session are not the same', async () => {
			const res = await sessionAPI.evaluate((ctx) => ctx.match('newAuthToken', {someParam: 1}));
			test.expect(res).toBe(false);
		});
	});

	test.describe('`isExists`', () => {
		test('should return `true` if the session exists', async () => {
			await sessionAPI.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

			const res = await sessionAPI.evaluate((ctx) => ctx.isExists());
			test.expect(res).toBe(true);
		});

		test('should return `false` if the session does not exist', async () => {
			const res = await sessionAPI.evaluate((ctx) => ctx.isExists());
			test.expect(res).toBe(false);
		});
	});
});
