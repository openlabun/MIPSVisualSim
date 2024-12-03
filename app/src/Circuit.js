class Circuit {
	constructor() {
		this.components = [];
	}

	clock = () => {
		this.components.forEach((com) => {
			if (com.clock) com.clock();
		});
	};

	update = () => {
		this.components.forEach((com) => com.update());
	};

	addComponent = (com) => {
		this.components.push(com);
	};
}

export default Circuit;
