import type { ComponentRefs } from 'components/base/b-scrolly/interface';

export type SlotsStateObj = {
	[key in keyof ComponentRefs]: boolean;
};
