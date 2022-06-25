import iOpen from 'traits/i-open/i-open';
import type iBlock from 'super/i-block/i-block';
import type { DirectiveHookParams } from 'core/component/directives/aria/interface';
import RoleEngine from 'core/component/directives/aria/roles-engines/interface';

export default class DialogEngine extends RoleEngine {
	group: Dictionary = {};

	constructor(options: DirectiveHookParams) {
		super(options);

		if (!iOpen.is(options.vnode.fakeContext)) {
			Object.throw('Dialog directive expects the component to realize iOpen interface');
		}
	}

	override init(): void {
		const
			{localEmitter: $e} = Object.cast<iBlock['unsafe']>(this.vnode.fakeContext);

		this.el.setAttribute('role', 'dialog');
		this.el.setAttribute('aria-modal', 'false');

		this.group = {group: 'ariaAttributes'};

		$e.on('open', () => {
			this.el.setAttribute('aria-modal', 'true');
		}, this.group);

		$e.on('close', () => {
			this.el.setAttribute('aria-modal', 'false');
		}, this.group);
	}

	override clear(): void {
		const
			{localEmitter: $e} = Object.cast<iBlock['unsafe']>(this.vnode.fakeContext);

		$e.off(this.group);
	}
}
