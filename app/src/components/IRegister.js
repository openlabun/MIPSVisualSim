import Component from './base/Component.js';

class IRegister extends Component {
	constructor() {
		super(
			1,
			8,
			['data'],
			['op', 'rs', 'rt', 'rd', 'shamt', 'funct', 'jump', 'off']
		);
	}

	updateOutputs = () => {
		const data = this.values[0];
		
		this.outputs[0].value = data.substring(0, 6);
		this.outputs[1].value = data.substring(6, 11);
		this.outputs[2].value = data.substring(11, 16);
		this.outputs[3].value = data.substring(16, 21);
		this.outputs[4].value = data.substring(21, 26);
		this.outputs[5].value = data.substring(26, 32);
		this.outputs[6].value = data.substring(6, 32);
		this.outputs[7].value = data.substring(16, 32);
	};
}

export default IRegister;
