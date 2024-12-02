import ComponentClock from "./base/ComponentClock";

class Register extends ComponentClock {
	constructor() {
		super(5, 2, ['a', 'b', 'rw_signal', 'rw_data', 'rw_add'], ['out_a', 'out_b']);

		this.data = Array.from({length: 32}, () => '0');
	}

	updateOutputs = () => {
        const rw_signal = this.values[2];

        if (rw_signal === '1') {
            const data = this.values[3];
            const add = parseInt(this.values[4], 2);

            this.data[add] = data;
        }

        const numa = parseInt(this.values[0], 2);
        const numb = parseInt(this.values[1], 2);
        this.outputs[0].value = this.data[numa]
        this.outputs[1].value = this.data[numb]
	};
}

export default Register;