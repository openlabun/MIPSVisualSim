import ComponentClock from "./base/ComponentClock";

class Register extends ComponentClock {
	constructor() {
		super(1, 1, ['in_data'], ['out_data']);

		this.data = '0';
		this.outputs[0].value = '0';
	}

	updateOutputs = () => {
		this.data = this.values[0];
		this.outputs[0].value = this.data != '-' ? this.data : '0';
	};
}

export default Register;
