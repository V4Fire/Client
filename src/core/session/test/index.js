/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		dummyComponent,
		session,
		context;

	describe('`core/session`', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			page.goto(initialUrl);

			dummyComponent = await h.component.waitForComponent(page, '.b-dummy');
			session = await dummyComponent.evaluateHandle(({modules: {session}}) => session);
		});

		afterEach(() => context.close());

		describe('set', () => {
			it('stores a session', async () => {
				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

				const
					testVal = await session.evaluate((ctx) => ctx.get());

				expect(testVal).toEqual({auth: 'authToken', params: {someParam: 1}});
			});

			it('emits a `set` event', async () => {
				const
					eventPr = session.evaluate(({emitter}) => new Promise((res) => emitter.on('set', res)));

				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

				await expectAsync(eventPr).toBeResolvedTo({auth: 'authToken', params: {someParam: 1}});
			});
		});

		describe('get', () => {
			it('returns session data if the session was initialized', async () => {
				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

				const
					testVal = await session.evaluate((ctx) => ctx.get());

				expect(testVal).toEqual({auth: 'authToken', params: {someParam: 1}});
			});

			it('returns `undefined` if the session was not initialized', async () => {
				const
					testVal = await session.evaluate((ctx) => ctx.get());

				expect(testVal).toEqual({auth: undefined, params: undefined});
			});
		});

		describe('clear', () => {
			it('clears the stored session', async () => {
				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));
				await session.evaluate((ctx) => ctx.clear());

				const
					testVal = await session.evaluate((ctx) => ctx.get());

				expect(testVal).toEqual({auth: undefined, params: undefined});
			});

			it('emits a `clear` event', async () => {
				const
					eventPr = session.evaluate(({emitter}) => new Promise((res) => emitter.on('clear', res)));

				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));
				await session.evaluate((ctx) => ctx.clear());

				await expectAsync(eventPr).toBeResolved();
			});
		});

		describe('match', () => {
			beforeEach(() => session.evaluate((ctx) => ctx.set('authToken', {someParam: 1})));

			it('returns `true` if the current session and the provided session are the same', async () => {
				const
					testVal = await session.evaluate((ctx) => ctx.match('authToken', {someParam: 1}));

				expect(testVal).toBeTrue();
			});

			it('returns `false` if the current session and the provided session are not the same', async () => {
				const
					testVal = await session.evaluate((ctx) => ctx.match('newAuthToken', {someParam: 1}));

				expect(testVal).toBeFalse();
			});
		});

		describe('isExists', () => {
			it('returns `true` is the session exists', async () => {
				await session.evaluate((ctx) => ctx.set('authToken', {someParam: 1}));

				const
					testVal = await session.evaluate((ctx) => ctx.isExists());

				expect(testVal).toBeTrue();
			});

			it('returns `false` is the session does not exist', async () => {
				const
					testVal = await session.evaluate((ctx) => ctx.isExists());

				expect(testVal).toBeFalse();
			});
		});
	});
};
