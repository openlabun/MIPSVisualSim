import { v4 as uuidv4 } from 'uuid';

class Put {
	constructor(value = '-') {
		this.id = uuidv4();
		this.value = value;
	}
}

export default Put;
