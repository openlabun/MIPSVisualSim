import Component from './base/Component';

class Memory extends Component {
	constructor() {
		super(
			3,
			1,
			['read_address', 'write_address', 'write_data'],
			['mem_data']
		);

		this.data = ['instruccion0', 'instruccion1', 'instruccion2'];
	}

	setAllData = (data) => {
		this.data = data;
	};

	clock = () => {
		const numDir = parseInt(this.values[1], 2);
		const wdata = this.values[2];
		this.data[numDir] = wdata;

		this.updateOutputs();
		this.connected.forEach((com) => com.update());
	};

	updateOutputs = () => {
		const numInst = parseInt(this.values[0], 2);
		const inst = this.data[numInst];
		this.outputs[0].value = inst || '-';
	};
}

export default Memory;
