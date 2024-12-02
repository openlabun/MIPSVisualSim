import Component from './Component.js';

class ComponentClock extends Component {
	constructor(inNum, outNum, inNames = [], outNames = []) {
		super(inNum, outNum, inNames, outNames);
	}

	update = () => {
		if (
			this.values.every((v, i) => {
				if (this.inputs[i]) this.inputs[i].value === v;
			})
		)
			return;

		this.updateValues();
	};

	clock = () => {
		this.updateOutputs();
		this.connected.forEach((com) => com.update());
	};
}

export default ComponentClock;
