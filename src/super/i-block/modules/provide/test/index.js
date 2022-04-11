// @ts-check

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers').default;

/**
 * Starts a test
 *
 * @param {Page} page
 * @param {!Object} params
 * @returns {!Promise<void>}
 */
module.exports = async (page, params) => {
	await h.utils.setup(page, params.context);

	let
		target;

	beforeAll(async () => {
		await page.evaluate(() => {
			const scheme = [
				{
					attrs: {
						id: 'target'
					}
				}
			];

			globalThis.renderComponents('b-dummy', scheme);
		});

		target = await h.component.waitForComponent(page, '#target');
	});

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('`iBlock.provide`', () => {
		describe('`fullComponentName`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.fullComponentName()))
					.toBe('b-dummy');
			});

			it('providing a modifier', async () => {
				expect(await target.evaluate(({provide}) => provide.fullComponentName('opened', true)))
					.toBe('b-dummy_opened_true');
			});

			it('providing a component name', async () => {
				expect(await target.evaluate(({provide}) => provide.fullComponentName('b-foo')))
					.toBe('b-foo');
			});

			it('providing a component name and modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.fullComponentName('b-foo', 'opened', true)))
					.toBe('b-foo_opened_true');
			});
		});

		describe('`fullElName`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.fullElName('foo')))
					.toBe('b-dummy__foo');
			});

			it('providing a modifier', async () => {
				expect(await target.evaluate(({provide}) => provide.fullElName('foo', 'opened', true)))
					.toBe('b-dummy__foo_opened_true');
			});

			it('providing a component name', async () => {
				expect(await target.evaluate(({provide}) => provide.fullElName('b-foo', 'foo')))
					.toBe('b-foo__foo');
			});

			it('providing a component name and modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.fullElName('b-foo', 'foo', 'opened', true)))
					.toBe('b-foo__foo_opened_true');
			});
		});

		describe('`mods`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.mods()))
					.toEqual({foo: 'bar'});
			});

			it('providing additional modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.mods({baz: 'bla'})))
					.toEqual({foo: 'bar', baz: 'bla'});
			});
		});

		describe('`classes`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.classes({button: true})))
					.toEqual({button: 'b-dummy__button'});

				expect(await target.evaluate(({provide}) => provide.classes({button: 'submit'})))
					.toEqual({button: 'b-dummy__submit'});
			});

			it('providing additional modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.classes({button: ['submit', 'focused', 'true']})))
					.toEqual({button: 'b-dummy__submit_focused_true'});
			});

			it('providing a component name', async () => {
				expect(await target.evaluate(({provide}) => provide.classes('b-foo', {button: true})))
					.toEqual({button: 'b-foo__button'});

				expect(await target.evaluate(({provide}) => provide.classes('b-foo', {button: 'submit'})))
					.toEqual({button: 'b-foo__submit'});
			});

			it('providing a component name and additional modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.classes('b-foo', {button: ['submit', 'focused', 'true']})))
					.toEqual({button: 'b-foo__submit_focused_true'});
			});
		});

		describe('`componentClasses`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.componentClasses()))
					.toEqual(['b-dummy']);
			});

			it('providing additional modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.componentClasses({opened: true, selected: false})))
					.toEqual(['b-dummy', 'b-dummy_opened_true', 'b-dummy_selected_false']);
			});

			it('providing a component name', async () => {
				expect(await target.evaluate(({provide}) => provide.componentClasses('b-foo')))
					.toEqual(['b-foo']);
			});

			it('providing a component name and additional modifiers', async () => {
				expect(await target.evaluate(({provide}) => provide.componentClasses('b-foo', {opened: true, selected: false})))
					.toEqual(['b-foo', 'b-foo_opened_true', 'b-foo_selected_false']);
			});
		});

		describe('`elClasses`', () => {
			it('simple usage', async () => {
				const id = await target.evaluate(({componentId}) => componentId);

				expect(await target.evaluate(({provide}) => provide.elClasses({button: {focused: true}})))
					.toEqual([id, 'b-dummy__button', 'b-dummy__button_focused_true']);
			});

			it('providing a component name', async () => {
				expect(await target.evaluate(({provide}) => provide.elClasses('b-foo', {button: {focused: true}})))
					.toEqual(['b-foo__button', 'b-foo__button_focused_true']);
			});

			it('providing a component context', async () => {
				const ctx = {
					componentId: 'baz',
					componentName: 'b-foo'
				};

				expect(await target.evaluate(({provide}, ctx) => provide.elClasses(ctx, {button: {focused: true}}), ctx))
					.toEqual(['baz', 'b-foo__button', 'b-foo__button_focused_true']);
			});
		});

		describe('`hintClasses`', () => {
			it('simple usage', async () => {
				expect(await target.evaluate(({provide}) => provide.hintClasses()))
					.toEqual(['g-hint', 'g-hint_pos_bottom']);
			});

			it('providing position', async () => {
				expect(await target.evaluate(({provide}) => provide.hintClasses('top')))
					.toEqual(['g-hint', 'g-hint_pos_top']);
			});
		});
	});
};
