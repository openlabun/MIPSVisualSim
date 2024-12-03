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

function translateInstructionToHex(instruction) {
    const opcodeMap = {
        "add": "000000", "sub": "000000", "slt": "000000", "and": "000000", "or": "000000",
        "addi": "001000", "lw": "100011", "sw": "101011",
        "beq": "000100", "bne": "000101",
        "j": "000010"
    };

    const funcMap = {
        "add": "100000", "sub": "100010", "slt": "101010", "and": "100100", "or": "100101",
    };

    const regMap = {
        "zero": "00000", "at": "00001", "v0": "00010", "v1": "00011",
        "a0": "00100", "a1": "00101", "a2": "00110", "a3": "00111",
        "t0": "01000", "t1": "01001", "t2": "01010", "t3": "01011",
        "t4": "01100", "t5": "01101", "t6": "01110", "t7": "01111",
        "s0": "10000", "s1": "10001", "s2": "10010", "s3": "10011",
        "s4": "10100", "s5": "10101", "s6": "10110", "s7": "10111",
        "t8": "11000", "t9": "11001", "k0": "11010", "k1": "11011",
        "gp": "11100", "sp": "11101", "fp": "11110", "ra": "11111"
    };

    const parts = instruction.split(' ');

    const opcode = opcodeMap[parts[0]];
    if (!opcode) return "Unknown Instruction";

    let binaryInstruction = opcode;
    console.log(parts[0]);
    if (["add", "sub", "slt", "and", "or"].includes(parts[0])) {
        // R-type instruction
        const rd = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const rt = regMap[parts[3]];
        if (!rd || !rs || !rt) return "Invalid Registers";
        binaryInstruction += rs + rt + rd + "00000" + funcMap[parts[0]];
    } else if (["lw", "sw"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[3].split(',')[0]];
        const immediate = parseInt(parts[2]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["addi"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const immediate = parseInt(parts[3]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
    } else if (["beq", "bne"].includes(parts[0])) {
        // I-type instruction
        const rs = regMap[parts[1]];
        const rt = regMap[parts[2]];
        const label = parts[3];
        if (!rs || !rt) return "Invalid Registers";
        // For simplicity, assuming label is an immediate value (offset)
        const offset = parseInt(label);
        if (isNaN(offset)) return "Invalid Syntax";
        binaryInstruction += rs + rt + (offset >>> 0).toString(2).padStart(16, '0');
    } else if (["j"].includes(parts[0])) {
        // J-type instruction
        const address = parseInt(parts[1]);
        if (isNaN(address)) return "Invalid Syntax";
        binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');
    } else {
        return "Unsupported Instruction";
    }

    // Convert binary instruction to hexadecimal
    const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
    //return "0x" + hexInstruction;
    return hexInstruction;
}

function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        let bin = parseInt(hex[i], 16).toString(2);
        binary += bin.padStart(4, '0');
    }
    return binary;
}

document.getElementById('simulate-mips-button').addEventListener('click', () => {
	const dataMPIS = document.getElementById('mips-input').value.split('\n');
	const dataBin = dataMPIS.map((ln) => hexToBinary(translateInstructionToHex(ln)));
	InstMem.setAllData(dataBin);
	cir.update();
});

function updateTable(data) {
    const container = document.getElementById('outputTableContainer');
    container.innerHTML = ''; 

    const table = document.createElement('table');
    table.border = '1';
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';

    // Crear encabezados
    const headerRow = document.createElement('tr');
    const headers = ['Componente', 'Datos'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '8px';
        th.style.textAlign = 'left';
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);


    data.forEach(row => {
        const tr = document.createElement('tr');

        const componentCell = document.createElement('td');
        componentCell.textContent = row.component;
        componentCell.style.padding = '8px';
        componentCell.style.verticalAlign = 'top';
        tr.appendChild(componentCell);

        const dataCell = document.createElement('td');
        dataCell.style.padding = '8px';
        dataCell.style.whiteSpace = 'pre-wrap'; 
        dataCell.style.wordWrap = 'break-word';
        dataCell.style.fontFamily = 'monospace'; 
        dataCell.style.maxHeight = '200px'; 
        dataCell.style.overflow = 'auto'; 


        dataCell.textContent = JSON.stringify(row.data, null, 2);

        tr.appendChild(dataCell);
        table.appendChild(tr);
    });

    container.appendChild(table); 
}
