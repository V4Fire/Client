/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface ImageTestImgData {
	style: Nullable<string>;
	dataImg: Nullable<string>;
	src: Nullable<string>;
	srcset: CanArray<Nullable<string>>;
	width: Nullable<number>;
	height: Nullable<number>;
	sizes: Nullable<string>;
	alt: Nullable<string>;
}

export interface ImageTestData {
	span: {
		style: Nullable<string>;
		dataImage: Nullable<string>;
	};
	img: Nullable<ImageTestImgData>;

	picture: Nullable<{
		sources: Array<{
			srcset: CanArray<Nullable<string>>;
		}>;
	}>;
}
