'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const plain = {
	text: {
		'Heading-3': {
			fontFamily: 'Roboto',
			fontWeight: 500,
			fontSize: '28px',
			lineHeight: '33px'
		},
		'Heading-2': {
			fontFamily: 'Roboto',
			fontWeight: 700,
			fontSize: '32px',
			lineHeight: '38px'
		},
		Heading1: {
			fontFamily: 'Roboto',
			fontWeight: 500,
			fontSize: '44px',
			lineHeight: '52px'
		},
		Base: {
			fontFamily: 'Roboto',
			fontWeight: 400,
			fontSize: '16px',
			lineHeight: '16px'
		},
		Small: {
			fontFamily: 'Roboto',
			fontWeight: 400,
			fontSize: '14px',
			lineHeight: '16px'
		}
	},
	rounding: {
		small: '8px', big: '16px'
	}
};

const plainWithAbstractColors = {
	...plain,
	colors: {
		primary: 'rgba(40,167,69,1)',
		secondary: 'rgba(220,53,69,1)'
	}
};

const plainWithHueInColorsName = {
	...plain,
	colors: {
		green: ['rgba(40,167,69,1)'],
		red: ['rgba(220,53,69,1)'],
		yellow: ['rgba(255,246,29,1)'],
		orange: ['hsla(255,193,7,1)'],
		blue: ['rgb(0,123,255)', 'rgba(23,162,184,1)', 'rgba(128,189,255,1)'],
		grey: [
			'rgba(33,37,41,1)',
			'rgba(52,58,64,1)',
			'rgba(108,117,125,1)',
			'rgba(248,249,250,1)',
			'rgba(207,212,217,1)',
			'rgba(233,236,239,1)',
			'rgba(173,181,189,1)'
		],
		white: ['rgba(255,255,255,1)']
	}
};

module.exports = {
	plainWithAbstractColors,
	plainDesignSystem: plainWithHueInColorsName
};
