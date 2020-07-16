/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

// eslint-disable-next-line no-inline-comments
module.exports = (/** @type Page */ page) => {

	describe('b-virtual-scroll events', () => {

		describe('dbChange', () => {

			describe('вызывается', () => {
				it('при загрузке первого чанка', async () => {
					// ...
				});

				it('при загрузки второго чанке', async () => {
					// ...
				});
			});

			describe('не вызывается', () => {
				it('если ничего не было загружено', async () => {
					// ...
				});

				it('если произошла ошибка загрузки', async () => {
					// ...
				});
			});

			describe('имеет корректный payload', () => {
				it('после загрузки первого чанка', async () => {
					// ...
				});

				it('после загрузки второго чанка', async () => {
					// ...
				});

				it('после переинициализации загрузки первого чанка', async () => {
					// ...
				});
			});
		});

		describe('startLoadingChunk', () => {

			describe('вызывается в начале', () => {
				it('загрузки первого чанка', async () => {
					// ...
				});

				it('загрузки второго чанка', async () => {
					// ...
				});

				it('загрузки первого чанка после переинициализации', async () => {
					// ...
				});
			});

			describe('имеет корректный payload', () => {
				it('после отрисовки первого чанка', async () => {
					// ...
				});

				it('после отрисовки второго чанка', async () => {
					// ...
				});
			});
		});

		describe('chunkRendered', () => {

			describe('вызывается', () => {
				it('после отрисовки чанка', async () => {
					// ...
				});
			});

			describe('имеет корректный payload', () => {
				it('после отрисовки первого чанка', async () => {
					// ...
				});

				it('после отрисовки второго чанка', async () => {
					// ...
				});
			});

		});

	});

};
