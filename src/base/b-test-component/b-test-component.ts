import iBlock, { prop, component, Module } from 'super/i-block/i-block';

export * from 'super/i-block/i-block';

@component()
export default class bTestComponent extends iBlock {
	// @prop({
	// 	default: [
	// 		{
	// 			id: 'b-test-component-inner',
	// 			load: () => import('base/b-test-component/modules/b-test-component-inner')
	// 		}
	// 	]
	// })
	//
	// override readonly dependenciesProp!: Module[];
}
