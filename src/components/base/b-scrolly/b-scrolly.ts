import iData, { component, field, RequestParams } from 'components/super/i-data/i-data';

@component()
export default class bScrolly extends iData {
	@field({forceUpdate: false})
	readonly data!: unknown[];

	// @ts-ignore (getter instead readonly)
	override get requestParams(): RequestParams {
		return {
			get: {}
		};
	}
}

// Модель дозапросов - остается такой же,
// изменение request влечет за собой перерендер, а requestQuery возвращает постранично параметры
