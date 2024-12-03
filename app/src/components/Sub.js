import Component from './base/Component.js';

class Sum extends Component {
	constructor(inNum) {
		super(
			inNum,
			1,
			Array.from({ length: inNum }, (v, i) => i.toString()),
			['out']
		);
	}

	updateOutputs = () => {
		const res = this.values.reduce(
			(prev, curr) => prev - parseInt(curr, 2),
			0
		);

		this.outputs[0].value = res.toString(2);
	};
}

export default Sum;
