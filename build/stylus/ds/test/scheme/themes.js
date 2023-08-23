/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const unThemeText = {
	meta: {
		themes: ['day', 'night'],
		themedFields: ['colors', 'rounding']
	},

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
			lineHeight: '16px',
			letterSpacing: '-0.02em'
		},
		Small: {
			fontFamily: 'Roboto',
			fontWeight: 400,
			fontSize: '14px',
			lineHeight: '16px'
		}
	},
	rounding: {
		theme: {
			day: {
				small: '8px',
				big: '16px'
			},

			night: {
				small: '4px',
				big: '8px'
			}
		}
	},
	colors: {
		theme: {
			day: {
				green: ['rgba(40,167,69,1)'],
				red: ['rgba(220,53,69,1)'],
				yellow: ['rgba(255,246,29,1)'],
				orange: ['rgba(255,193,7,1)'],
				white: ['rgba(255,255,255,1)']
			},

			night: {
				green: ['rgb(77,248,116)'],
				red: ['rgb(243,62,78)'],
				yellow: ['rgb(255,248,75)'],
				orange: ['rgb(198,148,0)'],
				white: ['rgb(255,255,255)']
			}
		}
	}
};

const themedOnlyColors = {
	meta: {
		themes: ['day', 'night'],
		themedFields: ['colors']
	},

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
	rounding: {small: '8px', big: '16px'},
	colors: {
		theme: {
			day: {
				green: ['rgba(40,167,69,1)'],
				white: ['rgba(255,255,255,1)']
			},

			night: {
				green: ['rgb(77,248,116)'],
				white: ['rgb(255,255,255)']
			}
		}
	}
};

const fullThemed = {
	meta: {
		themes: ['day', 'night']
	},

	text: {
		theme: {
			day: {
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
			night: {
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
			}
		}
	},
	rounding: {
		theme: {
			day: {
				small: '8px'
			},
			night: {
				big: '16px'
			}
		}
	},
	colors: {
		theme: {
			day: {
				green: ['rgba(40,167,69,1)'],
				white: ['rgba(255,255,255,1)']
			},

			night: {
				green: ['rgb(77,248,116)'],
				white: ['rgb(255,255,255)']
			}
		}
	}
};

module.exports = {
	fullThemed,
	unThemeText,
	themedOnlyColors
};
