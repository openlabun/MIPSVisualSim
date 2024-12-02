import Component from './base/Component.js';

class Control extends Component {
	constructor() {
		super(3, 1, ['ALUOP1', 'ALUOP2', 'funct'], ['s']);
	}

	updateOutputs = () => {
		const op = this.values[0] + this.values[1];
		const funct = this.values[2];
		let res = '';

		switch (op) {
			case '10':
				switch (funct) {
					case '100000':
						res = 10;
						break;
					case '100010':
						res = 11;
						break;
					case '100100':
						res = 0;
						break;
					case '100101':
						res = 1;
						break;
				}
				break;
			case '00':
				res = 10;
				break;
			case '01':
				res = 11;
				break;
			case '00':
				res = 10;
				break;
		}

		this.outputs[0].value = res;
	};
}

export default Control;
