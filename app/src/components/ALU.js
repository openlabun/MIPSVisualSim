import Component from './base/Component.js';

class ALU extends Component {
	constructor() {
		super(3, 2, ['a', 'b', 's'], ['result', 'zero']);
	}

	updateOutputs = () => {
        const num1 = parseInt(this.values[0], 2);
		const num2 = parseInt(this.values[1], 2);
		const op = parseInt(this.values[2], 2);
		let res = 0;

		switch (op) {
			case 0:
				// And
				res = (num1 & num2).toString(2);
				break;
			case 1:
				// Or
				res = (num1 | num2).toString(2);
				break;
			case 2:
				// sum
				res = (num1 + num2).toString(2);
				break;
			case 3:
				// sub
				res = (num1 - num2).toString(2);
				break;
			default:
				res = '-';
				break;
		}

		this.getOutput('result').value = res;
		if (res === '0') {
			this.getOutput('zero').value = '1';
		} else {
			this.getOutput('zero').value = '0';
		}
	};
}

export default ALU;
