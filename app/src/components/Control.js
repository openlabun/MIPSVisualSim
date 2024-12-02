import Component from './base/Component.js';

class Control extends Component {
	constructor() {
		super(
			1,
			11,
			['op'],
			[
				'regdst',
				'regwrite',
				'jump',
				'beq',
				'bne',
				'alusrc',
				'memToReg',
				'memRead',
				'memWrite',
				'ALUOP1',
				'ALUOP2',
			]
		);
	}

	updateOutputs = () => {
		const op = this.values[0];
		let res = '';

		switch (op) {
			case '000000':
				res = '11000000010';
				break;
			case '100011':
				res = '01000111000';
				break;
			case '101011':
				res = '00000100100';
				break;
			case '001000':
				res = '01000100000';
				break;
			case '000101':
				res = '00001000001';
				break;
			case '000100':
				res = '00010000001';
				break;
			case '000010':
				res = '00100000000';
				break;
			case '111111':
				res = '10000000000';
				break;
			default:
				res = '10000000000';
				break;
		}

		res.split('').forEach((v, i) => (this.outputs[i].value = v));
	};
}

export default Control;
