import Konva from 'konva';
import Put from './Put.js';
import { v4 as uuidv4 } from 'uuid';

class Component {
	constructor(inNum, outNum, inNames = [], outNames = [], name = 'None') {
		this.id = uuidv4();
		this.name = name;
		this.inNames = Array.from(
			{ length: inNum },
			(v, i) => inNames[i] ?? `No_Name_${i}`
		);
		this.outNames = Array.from(
			{ length: outNum },
			(v, i) => outNames[i] ?? `No_Name_${i}`
		);

		this.values = Array.from({ length: inNum }, () => '-');
		this.inputs = Array.from({ length: inNum }, () => null);
		this.outputs = Array.from({ length: outNum }, () => new Put());
		this.connected = [];

		this.figure = {
			text: null,
			form: null,
		};
	}

	setInput = (inName, com, putName) => {
		const num = this.inNames.indexOf(inName);
		if (num >= 0) {
			if (com instanceof Put) {
				this.inputs[num] = com;
			} else {
				this.inputs[num] = com.getOutput(putName);
				com.addConnected(this);
			}
		} else {
			console.error(`input ${this.name} not found in ${this.id}`);
		}
	};

	getOutput = (name) => {
		const num = this.outNames.indexOf(name);
		if (num >= 0) {
			return this.outputs[num];
		} else {
			console.error(`output ${name} not found in ${this.id}`);
		}
	};

	update = () => {
		if (
			this.values.every((v, i) => {
				if (this.inputs[i]) this.inputs[i].value === v;
			})
		)
			return;

		this.updateValues();
		this.updateOutputs();
		this.connected.forEach((com) => com.update());
		// this.activeFigure();
	};

	updateValues = () => {
		this.values = this.inputs.map((inp) => (inp ? inp.value : '-'));
	};

	updateOutputs = () => {
		// Do processes to update outputs

		this.outputs.forEach((out, index) => (out.value = this.values[index]));
	};

	addConnected = (com) => {
		this.connected.push(com);
	};

	initFigure = (properties) => {
		const config = {
			x: 10,
			y: 10,
			width: 50,
			height: 50,
			stroke: 'black',
			strokeWidth: 3,
			...properties
		};
		this.figure.text = new Konva.Text({
			x: properties.x,
			y: properties.y,
			text: this.name,
			fontSize: 12,
			fontFamily: 'Calibri',
			fill: '#555',
			align: 'center',
			padding: 10,
		});
		this.figure.form = new Konva.Rect(config);
	};

	updateFigure = (properties) => {
		if (this.figure.form) this.figure.form.setAttrs(properties);
	};

	activeFigure = () => {
		this.updateFigure({
			stroke: 'yellow',
		});
	};

	resetFigure = () => {
		this.updateFigure({
			stroke: 'black',
		});
	};
}

export default Component;
