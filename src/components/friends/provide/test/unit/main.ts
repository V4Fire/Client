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

import type bFriendsProvideDummy from 'components/friends/provide/test/b-friends-provide-dummy/b-friends-provide-dummy';

test.describe('friends/provide', () => {
	let target: JSHandle<bFriendsProvideDummy>;

	const componentName = 'b-friends-provide-dummy';

	/**
	 * Returns a string prefixed with "b-friends-provide-dummy"
	 *
	 * @example
	 * ```typescript
	 * prefix`__button` // b-friends-provide-dummy__button
	 * ```
	 */
	const prefix = (strings?: TemplateStringsArray) => `${componentName}${strings?.join(' ') ?? ''}`;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		await Component.waitForComponentTemplate(page, componentName);
		target = await Component.createComponent(page, componentName);
	});

	test.describe('`fullComponentName`', () => {
		test('should return the current component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName()))
				.toBeResolvedTo(componentName);
		});

		test('should return the current component name concatenated with the specified modifier and its value', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('opened', true)))
				.toBeResolvedTo(prefix`_opened_true`);
		});

		test('should return the specified component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('b-foo')))
				.toBeResolvedTo('b-foo');
		});

		test([
			'should return the specified component name concatenated',
			'with the specified modifier and its value'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullComponentName('b-foo', 'opened', true)))
				.toBeResolvedTo('b-foo_opened_true');
		});
	});

	test.describe('`fullElementName`', () => {
		test('should return the current component name concatenated with the specified element name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('foo')))
				.toBeResolvedTo(prefix`__foo`);
		});

		test([
			'should return the current component name concatenated with the specified element name,',
			'the specified modifier and its value'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('foo', 'opened', true)))
				.toBeResolvedTo(prefix`__foo_opened_true`);
		});

		test('should return the specified component name concatenated with the specified element name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('b-foo', 'foo')))
				.toBeResolvedTo('b-foo__foo');
		});

		test([
			'should return the specified component name concatenated with the specified element name,',
			'the specified modifier and its value'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.fullElementName('b-foo', 'foo', 'opened', true)))
				.toBeResolvedTo('b-foo__foo_opened_true');
		});
	});

	test.describe('`mods`', () => {
		test('should return a dictionary of provided modifiers and their values', async () => {
			await test.expect(target.evaluate(({provide}) => provide.mods({baz: 'bla'})))
				.resolves.toEqual({baz: 'bla'});
		});
	});

	test.describe('`classes` should return a dictionary', () => {
		test('with the specified element\'s class name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes({button: true})))
				.resolves.toEqual({button: prefix`__button`});
		});

		test('with the overridden element\'s class name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes({button: 'submit'})))
				.resolves.toEqual({button: prefix`__submit`});
		});

		test('with the overridden element\'s class name concatenated with the provided modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes({button: ['submit', 'focused', 'true']})))
				.resolves.toEqual({button: prefix`__submit_focused_true`});
		});

		test('with the specified component name concatenated with the specified element', async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: true})))
				.resolves.toEqual({button: 'b-foo__button'});
		});

		test([
			'with the class name consisting of the specified component\'s name',
			'and overridden name of the specified element'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: 'submit'})))
				.resolves.toEqual({button: 'b-foo__submit'});
		});

		test([
			'with the class name consisting of the specified component\'s name,',
			'overridden name of the specified element and the provided modifiers'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.classes('b-foo', {button: ['submit', 'focused', 'true']})))
				.resolves.toEqual({button: 'b-foo__submit_focused_true'});
		});
	});

	test.describe('`componentClasses`', () => {
		test('should return an array consisting of one element, which is a component name', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses()))
				.resolves.toEqual([componentName]);
		});

		test('should return an array consisting of the component name and the names generated from the provided modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses({opened: true, selected: false})))
				.resolves.toEqual([componentName, prefix`_opened_true`, prefix`_selected_false`]);
		});

		test('should return an array consisting of one element, which is provided as an argument', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses('b-foo')))
				.resolves.toEqual(['b-foo']);
		});

		test('should return an array consisting of the provided component name and names generated from the provided modifiers', async () => {
			await test.expect(target.evaluate(({provide}) => provide.componentClasses('b-foo', {opened: true, selected: false})))
				.resolves.toEqual(['b-foo', 'b-foo_opened_true', 'b-foo_selected_false']);
		});
	});

	test.describe('`elementClasses`', () => {
		test([
			'should return an array consisting of the component ID,',
			'the provided element class name, and the provided modifier classes'
		].join(' '), async () => {
			const id = await target.evaluate(({componentId}) => componentId);

			await test.expect(target.evaluate(({provide}) => provide.elementClasses({button: {focused: true}})))
				.resolves.toEqual([id, prefix`__button`, prefix`__button_focused_true`]);
		});

		test([
			'should return an array consisting of the element class name with the provided component name',
			'and class names with the provided modifier classes'
		].join(' '), async () => {
			await test.expect(target.evaluate(({provide}) => provide.elementClasses('b-foo', {button: {focused: true}})))
				.resolves.toEqual(['b-foo__button', 'b-foo__button_focused_true']);
		});

		test('should return element class names according to the provided context', async () => {
			const ctx = {
				componentId: 'baz',
				componentName: 'b-foo'
			};

			await test.expect(
				target.evaluate(({provide}, ctx) => provide.elementClasses(Object.cast(ctx), {button: {focused: true}}), ctx)
			).resolves.toEqual(['baz', 'b-foo__button', 'b-foo__button_focused_true']);
		});
	});

	test.describe('`hintClasses`', () => {
		test('should return hint classes with the default position', async () => {
			await test.expect(target.evaluate(({provide}) => provide.hintClasses()))
				.resolves.toEqual(['g-hint', 'g-hint_pos_bottom']);
		});

		test('should return hint classes with the provided position', async () => {
			await test.expect(target.evaluate(({provide}) => provide.hintClasses('top')))
				.resolves.toEqual(['g-hint', 'g-hint_pos_top']);
		});
	});
});
