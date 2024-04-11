import iBlock, { component } from 'components/super/i-block/i-block';
import { field, system } from 'core/component';

export * from 'components/super/i-block/i-block';


@component()
export default class bExample extends iBlock {
    @system()
    imageParams = {src: 'https://fakeimg.pl/300x300'};

    @system()
    hash = Object.fastHash(this.imageParams);

    mounted() {
    }
}