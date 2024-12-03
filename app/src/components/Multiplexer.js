import Component from './base/Component.js';

class Multiplexer extends Component {
	constructor(inNum) {
		super(
			inNum + 1,
			1,
			['s', ...Array.from({ length: inNum }, (v, i) => i.toString())],
			['out']
		);
	}

	updateOutputs = () => {
		const s_value = parseInt(this.values[0], 2);

		this.outputs[0].value = this.values[s_value+1];
	};
}

export default Multiplexer;
