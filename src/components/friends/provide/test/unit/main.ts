/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bDummyFriendsProvide from 'components/friends/provide/test/b-friends-provide-dummy/b-friends-provide-dummy';

test.describe('friends/provide', () => {

	let target: JSHandle<bDummyFriendsProvide>;

	const
		componentName = 'b-friends-provide-dummy',
		prefix = (strings?: TemplateStringsArray) => `${componentName}${strings?.join(' ') ?? ''}`;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent(page, componentName);
		await Component.waitForComponentTemplate(page, componentName);
	});

	test.describe('`fullComponentName`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName()))
				.resolves.toBe(componentName);
		});

		test('providing a modifier', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('opened', true)))
				.resolves.toBe(prefix`_opened_true`);
		});

		test('providing a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('b-foo')))
				.resolves.toBe('b-foo');
		});

		test('providing a component name and modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('b-foo', 'opened', true)))
				.resolves.toBe('b-foo_opened_true');
		});
	});

	test.describe('`fullElementName`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('foo')))
				.resolves.toBe(prefix`__foo`);
		});

		test('providing a modifier', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('foo', 'opened', true)))
				.resolves.toBe(prefix`__foo_opened_true`);
		});

		test('providing a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('b-foo', 'foo')))
				.resolves.toBe('b-foo__foo');
		});

		test('providing a component name and modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('b-foo', 'foo', 'opened', true)))
				.resolves.toBe('b-foo__foo_opened_true');
		});
	});

	test.describe('`mods`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.mods()))
				.resolves.toEqual({foo: 'bar'});
		});

		test('providing additional modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.mods({baz: 'bla'})))
				.resolves.toEqual({foo: 'bar', baz: 'bla'});
		});
	});

	test.describe('`classes`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes({button: true})))
				.resolves.toEqual({button: prefix`__button`});

			await test.expect(target.evaluate(({provide}) => provide.classes({button: 'submit'})))
				.resolves.toEqual({button: prefix`__submit`});
		});

		test('providing additional modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes({button: ['submit', 'focused', 'true']}))).resolves
				.toEqual({button: prefix`__submit_focused_true`});
		});

		test('providing a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: true})))
				.resolves.toEqual({button: 'b-foo__button'});

			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: 'submit'})))
				.resolves.toEqual({button: 'b-foo__submit'});
		});

		test('providing a component name and additional modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: ['submit', 'focused', 'true']})))
				.resolves.toEqual({button: 'b-foo__submit_focused_true'});
		});
	});

	test.describe('`componentClasses`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses()))
				.resolves.toEqual([componentName]);
		});

		test('providing additional modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses({opened: true, selected: false})))
				.resolves.toEqual([componentName, prefix`_opened_true`, prefix`_selected_false`]);
		});

		test('providing a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses('b-foo')))
				.resolves.toEqual(['b-foo']);
		});

		test('providing a component name and additional modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses('b-foo', {opened: true, selected: false})))
				.resolves.toEqual(['b-foo', 'b-foo_opened_true', 'b-foo_selected_false']);
		});
	});

	test.describe('`elClasses`', () => {
		test('simple usage', async () => {
			const id = await target.evaluate(({componentId}) => componentId);

			await test.expect(target.evaluate(({provide}) => provide.elementClasses({button: {focused: true}})))
				.resolves.toEqual([id, prefix`__button`, prefix`__button_focused_true`]);
		});

		test('providing a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.elementClasses('b-foo', {button: {focused: true}})))
				.resolves.toEqual(['b-foo__button', 'b-foo__button_focused_true']);
		});

		test('providing a component context', async () => {
			const ctx = {
				componentId: 'baz',
				componentName: 'b-foo'
			};

			await test.expect(target.evaluate(({provide}, ctx) => provide.elementClasses(ctx, {button: {focused: true}}), ctx))
				.resolves.toEqual(['baz', 'b-foo__button', 'b-foo__button_focused_true']);
		});
	});

	test.describe('`hintClasses`', () => {
		test('simple usage', async () => {
			await test.expect(target.evaluate(({provide}) => provide.hintClasses()))
				.resolves.toEqual(['g-hint', 'g-hint_pos_bottom']);
		});

		test('providing position', async () => {
			await test.expect(target.evaluate(({provide}) => provide.hintClasses('top')))
				.resolves.toEqual(['g-hint', 'g-hint_pos_top']);
		});
	});
});
