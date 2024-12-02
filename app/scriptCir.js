import Konva from 'konva';
import Circuit from './src/Circuit.js';
import Put from './src/components/base/Put.js';
import Control from './src/components/Control.js';
import IRegister from './src/components/IRegister.js';
import Memory from './src/components/Memory.js';
import Register from './src/components/Register.js';
import Sum from './src/components/Sum.js';

const cir = new Circuit();

const PC = new Register();
const PCS1 = new Sum(2);
const InstMem = new Memory();
const ID = new IRegister();
const UC = new Control();

PCS1.setInput('0', PC, 'out_data');
PCS1.setInput('1', new Put('1'));
PCS1.initFigure({
	x: 50,
});

PC.setInput('in_data', PCS1, 'out');
PC.initFigure({
	x: 100,
});

InstMem.setInput('read_address', PC, 'out_data');
InstMem.initFigure({
	x: 150,
});

ID.setInput('data', InstMem, 'mem_data');
ID.initFigure({
	x: 200,
});

UC.setInput('op', ID, 'op');
UC.initFigure({
	x: 250,
});

cir.addComponent(PC);
cir.addComponent(PCS1);
cir.addComponent(InstMem);
cir.addComponent(ID);
cir.addComponent(UC);
cir.update();

const stage = new Konva.Stage({
	container: 'containerKonva',
	width: 340,
	height: 300,
});
const layer = new Konva.Layer();
cir.components.forEach((com) => {
	layer.add(com.figure.form);
	layer.add(com.figure.text);
});
stage.add(layer);

console.log(PC);
console.log(InstMem);
console.log(ID);
console.log(UC);

document.getElementById('updateClock').addEventListener('click', () => {
	cir.clock();
	layer.draw();
	console.log(PC);
	console.log(InstMem);
	console.log(ID);
	console.log(UC);
});
document.getElementById('simulate-mips-button').addEventListener('click', () => {
	InstMem.setAllData([
		'00100001000010010000000000000001',
		'00100001000010100000000000000011',
		'00000001011010010101100000100000',
	]);
	cir.update();
});
