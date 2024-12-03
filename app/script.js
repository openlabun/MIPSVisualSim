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
        const rs = regMap[parts[2].split(',')[0]];
        const immediate = parseInt(parts[2].split(',')[1]);
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

function translateInstructionToMIPS(hexInstruction) {
    console.log("hexInstruction", hexInstruction);
    const opcodeMap = {
        "000000": "add", "000000": "sub", "000000": "slt", "000000": "and", "000000": "or",
        "001000": "addi", "100011": "lw", "101011": "sw",
        "000100": "beq", "000101": "bne",
        "000010": "j"
    };

    const funcMap = {
        "100000": "add",
        "100010": "sub",
        "101010": "slt",
        "100100": "and",
        "100101": "or",
    };

    const regMap = {
        "00000": "zero", "00001": "at", "00010": "v0", "00011": "v1",
        "00100": "a0", "00101": "a1", "00110": "a2", "00111": "a3",
        "01000": "t0", "01001": "t1", "01010": "t2", "01011": "t3",
        "01100": "t4", "01101": "t5", "01110": "t6", "01111": "t7",
        "10000": "s0", "10001": "s1", "10010": "s2", "10011": "s3",
        "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
        "11000": "t8", "11001": "t9", "11010": "k0", "11011": "k1",
        "11100": "gp", "11101": "sp", "11110": "fp", "11111": "ra"
    };
    const binaryInstruction = hexToBinary(hexInstruction);
    const opcode = binaryInstruction.slice(0, 6);
    console.log(opcode);
    const opcodeMIPS = opcodeMap[opcode];
    if (!opcodeMIPS) return "Unknown Instruction, opcode null";

    let mipsInstruction = opcodeMIPS + " ";

    if (["add", "sub", "slt", "and", "or"].includes(opcodeMIPS)) {
        // R-type instruction
        const func = binaryInstruction.slice(26, 32);;
        console.log("Instruction func ", func);
        const funcMIPS = funcMap[func];
        console.log("Instruction ", funcMIPS);
        if (!funcMIPS) return "Unknown Instruction (function)";
        mipsInstruction = funcMIPS + " ";
        const rs = regMap[binaryInstruction.slice(6, 11)];
        const rt = regMap[binaryInstruction.slice(11, 16)];
        const rd = regMap[binaryInstruction.slice(16, 21)];
        if (!rs || !rt || !rd) return "Invalid Registers";
        mipsInstruction += rd + " " + rs + " " + rt;
    } else if (["lw", "sw"].includes(opcodeMIPS)) {
        // I-type instruction
        const rt = regMap[binaryInstruction.slice(6, 11)];
        const rs = regMap[binaryInstruction.slice(11, 16)];
        const offset = binaryInstruction.slice(16, 32);
        console.log('lw, sw offset ', binaryToHex(offset));
        if (!rt || !rs || isNaN(offset)) return "Invalid Syntax";
        mipsInstruction += rs + " " + rt + " " + binaryToHex(offset);
    } else if (["addi"].includes(opcodeMIPS)) {
        // I-type instruction
        console.log("I-type instruction, addi");
        const rt = regMap[binaryInstruction.slice(6, 11)];
        const rs = regMap[binaryInstruction.slice(11, 16)];
        // const immediate = parseInt(binaryInstruction.slice(16, 32), 16);
        console.log('immediate ', binaryInstruction.slice(16, 32));
        console.log('immediate formated ', binaryToHex(binaryInstruction.slice(16, 32)));
        const immediate = binaryToHex(binaryInstruction.slice(16, 32));
        if (!rt || !rs || !immediate) return "Invalid Syntax";
        mipsInstruction += rs + " " + rt + " " + immediate;
    } else if (["beq", "bne"].includes(opcodeMIPS)) {
        // I-type instruction
        const rs = regMap[binaryInstruction.slice(6, 11)];
        const rt = regMap[binaryInstruction.slice(11, 16)];
        const offset = parseInt(binaryInstruction.slice(16, 32), 16);
        if (!rs || !rt || isNaN(offset)) return "Invalid Syntax";
        // For simplicity, assuming label is an immediate value (offset)
        mipsInstruction += rs + " " + rt + " " + offset;
    } else if (["j"].includes(opcodeMIPS)) {
        // J-type instruction
        const address = binaryToHex(binaryInstruction.slice(6, 32));
        if (isNaN(address)) return "Invalid Syntax";
        mipsInstruction += address;
    } else {
        return "Unsupported Instruction opcode", opcodeMIPS;
    }

    return mipsInstruction;
}


// UTILITY FUNCTIONS

function binaryToHex(binaryString) {
    // Pad the binary string with leading zeros to ensure it's a multiple of 4
    while (binaryString.length % 4 !== 0) {
        binaryString = '0' + binaryString;
    }

    // Initialize an empty string to store the hexadecimal representation
    let hexString = '';

    // Convert each group of 4 bits to its hexadecimal equivalent
    for (let i = 0; i < binaryString.length; i += 4) {
        const binaryChunk = binaryString.substr(i, 4); // Get a chunk of 4 bits
        const hexDigit = parseInt(binaryChunk, 2).toString(16); // Convert the chunk to hexadecimal
        hexString += hexDigit; // Append the hexadecimal digit to the result
    }

    // Return the hexadecimal representation
    return "0x" + hexString.toUpperCase(); // Convert to uppercase for consistency
}

function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        let bin = parseInt(hex[i], 16).toString(2);
        binary += bin.padStart(4, '0');
    }
    return binary;
}



function sum(a, b) {
    return a + b;
}



document.addEventListener('DOMContentLoaded', function () {
    // Initialize tables when the page loads
    initializeTables();

    const mipsInput = document.getElementById('mips-input');
    const hexInput = document.getElementById('hex-input');
    const simulateMipsButton = document.getElementById('simulate-mips-button');
    const saveHexButton = document.getElementById('save-to-ram-button');
    const simulationTables = document.getElementById('simulation-tables');


    simulateMipsButton.addEventListener('click', simulateMIPS);

    // Get references to the drop area and the file input
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');




    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop area when a file is dragged over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    // Unhighlight drop area when a file is dragged away
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);



    // Function to prevent default drag behaviors
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Function to highlight the drop area when a file is dragged over
    function highlight() {
        dropArea.classList.add('highlight');
    }

    // Function to unhighlight the drop area when a file is dragged away
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }

    // Function to handle dropped files
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        processFiles(files);
    }

    // Optional: You can add hover effect to the drop area
    dropArea.addEventListener('mouseenter', () => {
        dropArea.style.backgroundColor = '#f0f0f0';
    });

    dropArea.addEventListener('mouseleave', () => {
        dropArea.style.backgroundColor = '';
    });

    function processFiles(files) {
        const reader = new FileReader();

        reader.onload = function (event) {
            const fileContent = event.target.result;
            const lines = fileContent.trim().split('\n');

            // If there are less than two lines, return because the file is not formatted as expected
            if (lines.length < 2) {
                console.error("Invalid file format. Expected at least two lines.");
                return;
            }

            // Split the second line by spaces to get individual instructions
            const instructionsArray = lines[1].trim().split(/\s+/);

            // Translate each instruction and build the translated instructions for input textarea
            let translatedInstructions = '';
            let originalInstructions = '';
            instructionsArray.forEach(instruction => {
                const translated = translateInstructionToMIPS(instruction.trim());
                translatedInstructions += `${translated}\n`;
                originalInstructions += `${instruction.trim()}\n`;
            });

            // Set the value of input textarea with translated instructions
            mipsInput.value = translatedInstructions.trim();
            hexInput.value = originalInstructions.trim();
        };

        reader.readAsText(files[0]);
    }

    function saveHexToFile() {
        // Get the value of the inputHex textarea
        const hexInstructions = hexInput.value.trim();

        // Check if hexInstructions is empty
        if (!hexInstructions) {
            console.error("No instructions found in inputHex textarea.");
            return;
        }

        // Split the hexInstructions by newline characters to get individual instructions
        const instructionsArray = hexInstructions.split('\n');

        // Join the instructions with a space to format them on the second line
        const instructionsLine = instructionsArray.join(' ');

        // Create a Blob with the hex instructions and instructions line
        const blob = new Blob(['v2.0 raw\n' + instructionsLine], { type: 'text/plain' });

        // Create a temporary anchor element to trigger the download
        const anchor = document.createElement('a');
        anchor.download = 'mips_instructions.hex';
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
    }

    function translateHextoMIPS() {
        const instructions = hexInput.value.trim().split('\n');

        // Translate each hexadecimal instruction to MIPS
        const translatedInstructions = instructions.map(instruction => {
            return translateInstructionToMIPS(instruction.trim());
        });

        // Join the translated instructions with a newline character
        const formattedInstructions = translatedInstructions.join('\n');

        // Set the value of the input textarea to the formatted instructions
        mipsInput.value = formattedInstructions;
    }

    function updateTables(registers, memory) {
        // Update the table with register values
        const registerTable = document.getElementById('registerTable');
        const rows = registerTable.getElementsByTagName('tr');
        for (let i = 1; i < rows.length; i++) {
            const registerName = rows[i].cells[0].textContent;
            //console.log(registerName);
            const registerValue = registers[registerName].toString(16).toUpperCase();
            rows[i].cells[1].textContent = '0x' + registerValue;
            //console.log(registerName,'0x'+registerValue);
        }

        // Update the table with memory values
        const memoryTable = document.getElementById('ramTable');
        const memRows = memoryTable.getElementsByTagName('tr');
        for (let i = 1; i < memRows.length; i++) {
            let memoryAddress = memRows[i].cells[0].textContent;
            // convert memoryAddress to decimal from hex
            memoryAddress = parseInt(memoryAddress, 16);
            //console.log(memoryAddress, memory[memoryAddress]);
            const memoryValue = memory[memoryAddress].toString(16).toUpperCase();
            memRows[i].cells[1].textContent = '0x' + memoryValue;
        }
    }

    let registers = {
        zero: 0, at: 0, v0: 0, v1: 0,
        a0: 0, a1: 0, a2: 0, a3: 0,
        t0: 0, t1: 0, t2: 0, t3: 0,
        t4: 0, t5: 0, t6: 0, t7: 0,
        s0: 0, s1: 0, s2: 0, s3: 0,
        s4: 0, s5: 0, s6: 0, s7: 0,
        t8: 0, t9: 0, k0: 0, k1: 0,
        gp: 0, sp: 0, fp: 0, ra: 0,
        hi: 0, lo: 0
    };

    let memory = Array.from({ length: 32 }).reduce((acc, curr, i) => ({ ...acc, [i]: 0 }), {});

    function initializeTables() {
        initializeRAMTable();
        initializeRegisterTable();
    }
    function initializeRAMTable() {
        const ramTableBody = document.querySelector('#ramTable tbody');
        ramTableBody.innerHTML = '';
        
        // Generate RAM table rows (16 rows from 0x00 to 0x0F)
        for (let i = 0; i < 16; i++) {
            const row = document.createElement('tr');
            const addressCell = document.createElement('td');
            const valueCell = document.createElement('td');
            
            addressCell.textContent = `0x${i.toString(16).padStart(2, '0').toUpperCase()}`;
            valueCell.textContent = '0x00';
            
            row.appendChild(addressCell);
            row.appendChild(valueCell);
            ramTableBody.appendChild(row);
        }
    }
    function initializeRegisterTable() {
        const registerTableBody = document.querySelector('#registerTable tbody');
        registerTableBody.innerHTML = '';
        
        // Define register names
        const registers = [
            'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
            't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
            's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
            't8', 't9', 'k0', 'k1', 'gp', 'sp', 'fp', 'ra', 
            'hi', 'lo'
        ];
        
        
        // Generate register table rows
        registers.forEach(reg => {
            const row = document.createElement('tr');
            const nameCell = document.createElement('td');
            const valueCell = document.createElement('td');
            
            nameCell.textContent = reg;
            valueCell.textContent = '0x00';
            
            row.appendChild(nameCell);
            row.appendChild(valueCell);
            registerTableBody.appendChild(row);
        });
    }
    

    function simulateMIPS() {
        
        console.log('Activando PC block'); // Para debug
        activateBlock('pc-block');
        
        // Después de un pequeño delay, activamos Instruction Memory
        setTimeout(() => {
            console.log('Activando Instruction Memory block');
            activateBlock('inst-mem-block');
        }, 500);
        // Después activamos Register File
        setTimeout(() => {
            console.log('Activando Register File block');
            activateBlock('registers-block');
        }, 1000);
        // Después activamos ALU
        setTimeout(() => {
            console.log('Activando ALU block');
            activateBlock('alu-block');
        }, 1500);
        // Finalmente activamos Data Memory
        setTimeout(() => {
            console.log('Activando Data Memory block');
            activateBlock('data-mem-block');
        }, 2000);
        // Scroll to the datapath section

        
        document.getElementById('datapath-section').scrollIntoView({ behavior: 'smooth' });

        
        
        // Get the value of the inputHex textarea and split it into instructions
        const hexInstructions = mipsInput.value.trim().split('\n');

        // Initialize registers and memory
        resetMIPS();
        

        // Iterate over each hexadecimal instruction
        const allInstructions=[];
        hexInstructions.forEach(instruction => {
            allInstructions.push(instruction);
        });

        let PC=0;
        while(PC<allInstructions.length){
            PC=executeMIPSInstruction(allInstructions[PC], registers, memory,PC);
            if(PC==-1){
                break;
            }
        }
        // Display the final values of registers and memory
        console.log('Final Registers:', registers);
        console.log('Final Memory:', memory);

        // Update tables
        updateTables(registers, memory);
    }

    function executeMIPSInstruction(instruction, registers, memory, PC) {
        //Simular recorrido
        console.log('current instruction: ', instruction);


        // Split MIPS instruction into operation and operands
        const [op, ...operands] = instruction.split(' ');
        // Implement execution logic for each MIPS operation
        switch (op) {
            //FUNCIONA
            case 'add':
            case 'addu': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] + registers[rt];
                PC++;
                break;
            }
            //FUNCIONA
            case 'sub': 
            case 'subu':{
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] - registers[rt];
                PC++;

                break;
            }
            //FUNCIONA
            case 'slt': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
                PC++;

                break;
            }
            //FUNCIONA
            case 'and': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] & registers[rt];
                PC++;

                break;
            }
            //FUNCIONA
            case 'andi':
            case 'ori':
            case 'xori':{
                const [rd, rs, immediate] = operands;
                if(op=='andi'){
                    registers[rd] = registers[rs] & parseInt(immediate);
                }else if(op=='ori'){
                    registers[rd] = registers[rs] | parseInt(immediate);
                }else{
                    registers[rd] = registers[rs] ^ parseInt(immediate);
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'or': 
            case 'xor':{
                const [rd, rs, rt] = operands;
                if (op=='xor'){
                    registers[rd]= registers[rs]^registers[rt];
                }else{
                    registers[rd] = registers[rs] | registers[rt];
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'addi': 
            case 'addiu':{
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] + parseInt(immediate);
                PC++;
                break;
            }
            //FUNCIONA
            case 'lw': {
                const [rt, des] = operands;
                const  rs=(des.split('(')[1].split(')')[0]);
                const offset=(des.split('(')[0]);
                const address = registers[rs] + parseInt(offset);
                //console.log('lw address:', address);
                //console.log('lw memory value:', memory[address]);
                if (memory.hasOwnProperty(address)) {
                    registers[rt] = memory[address];
                } else {
                    console.error('Memory address not found:', address);
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'sw': {
                const [rt, des] = operands;
                const  rs=(des.split('(')[1].split(')')[0]);
                const offset=(des.split('(')[0]);
                const address = registers[rs] + parseInt(offset);
                //console.log('sw rt:', rt, 'rs', rs, 'offset', offset, 'address', address,'getting', registers[rt] );
                memory[address] = registers[rt];
                PC++;
                break;
            }
            //FUNCIONA
            case 'sll':
            case 'sra':
            case 'srl':{
                const [rd, rt, immediate] = operands;
                if(op=='sll'){
                    registers[rd] = registers[rt] << parseInt(immediate);
                }else if(op=='sra'){
                    registers[rd] = registers[rt] >> parseInt(immediate);
                }else if(op=='srl'){
                    registers[rd] = registers[rt] >>> parseInt(immediate);
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'sllv':
            case 'srav':
            case 'srlv':{
                const [rd, rt, rs] = operands;
                if(op=='sllv'){
                    registers[rd] = registers[rt] << registers[rs];
                }else if(op=='srav'){
                    registers[rd] = registers[rt] >> registers[rs];
                }else if(op=='srlv'){
                    registers[rd] = registers[rt] >>> registers[rs];
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'div':
            case 'divu':
            case 'mult':
            case 'multu':{
                const [rs, rt] = operands;
                if(op=='div'){
                    registers['hi'] = Math.floor(registers[rs] / registers[rt]);
                    registers['lo'] = registers[rs] % registers[rt];
                    
                }else if(op=='divu'){
                    registers['hi'] = Math.floor(Math.abs(registers[rs]) / Math.abs(registers[rt]));
                    registers['lo'] = Math.abs(registers[rs]) % Math.abs(registers[rt]);
                    
                }else{
                    let producto = registers[rs] * registers[rt];
                    registers['hi'] = Math.floor(producto / 0x100000000); // $hi
                    registers['lo'] = producto & 0xFFFFFFFF; // $lo
                }
                PC++;

                break;
            }
            //FUNCIONA
            case 'beq':
            case 'bne':{

                const [rs, rt, label] = operands;
                if(op=='beq'){
                    if(registers[rs]==registers[rt]){
                        PC=PC+parseInt(label);
                    }
                }else{
                    if(registers[rs]!=registers[rt]){
                        PC=PC+parseInt(label);
                    }
                }
                PC++;
                break;
            }
            //FUNCIONA
            case 'j':{
                const [immediate] = operands;
                //PC=immediate;
                PC=immediate;
            }
            break;
            // Add cases for other MIPS operations
            default: {
                console.error('Unsupported operation:', op);
                PC=-1
                break;
            }
        }
        return PC;
    }

    // SETUP THE DEBUGGER
    const debugPlayButton = document.getElementById('dg-run-button');
    const debugStepButton = document.getElementById('dg-step-in-button');
    const debugBackButton = document.getElementById('dg-step-over-button');
    const debugResetButton = document.getElementById('dg-reset-button');
    const debuggerInfo = document.querySelectorAll('#debugger-info>p');

    debugPlayButton.addEventListener('click', simulateMIPS);
    debugStepButton.addEventListener('click', stepMIPS);
    debugBackButton.addEventListener('click', stepBackMIPS);
    debugResetButton.addEventListener('click', resetMIPS);
    mipsInput.addEventListener('input', updateDebuggerInfo);

    // Initialize the program counter (PC) and history stack
    // TODO: DEACTIVATE THE DEBUGGER WHEN COMPLETE THE SIMULATION, SINCE IT DOES NOT USE THE PROGRAM COUNTER
    let PC = 0;
    const history = [];
    updateDebuggerInfo();

    function stepMIPS() {
        // Get the value of the inputHex textarea and split it into instructions
        const allInstructions=[];
        const hexInstructions = mipsInput.value.trim().split('\n');

        hexInstructions.forEach(instruction => {
            allInstructions.push(instruction);
        });
        
        if (PC >= allInstructions.length)
            return;

        // Push the previous state to the history stack
        // TODO: This can be improved by only storing the changes in state
        history.push({ PC, registers: { ...registers }, memory: { ...memory } });

        // Execute the current instruction
        PC=executeMIPSInstruction(hexInstructions[PC], registers, memory,PC);

        // Increment the program counter (PC)
        console.log('PC actual: ',PC);

        // Check if the program has finished
        if (PC >= hexInstructions.length) {
            console.log('Program finished');
            console.log('Program finished:', PC);
            console.log('Final Registers:', registers);
            console.log('Final Memory:', memory);

            // debugStepButton.disabled = true;
        }

        // Update tables
        updateTables(registers, memory);

        // Update debugger info
        updateDebuggerInfo();
    }

    function stepBackMIPS() {
        // Check if the PC is at the beginning of the program
        if (PC === 0) {
            console.log('No more steps to undo');
            return;
        }

        // Pop the last state from the history stack
        const lastState = history.pop();

        // Check if there's a state to restore
        if (lastState) {
            // Restore the state
            PC = lastState.PC;
            registers = lastState.registers;
            memory = lastState.memory;

            // Update tables
            updateTables(registers, memory);

            // Update debugger info
            updateDebuggerInfo();
        } else {
            console.log('No more steps to undo');
        }
    }

    function resetMIPS() {
        // Reset the program counter (PC) and history stack
        PC = 0;
        history.length = 0;

        // Reset the registers and memory
        registers = {
            zero: 0, at: 0, v0: 0, v1: 0,
            a0: 0, a1: 0, a2: 0, a3: 0,
            t0: 0, t1: 0, t2: 0, t3: 0,
            t4: 0, t5: 0, t6: 0, t7: 0,
            s0: 0, s1: 0, s2: 0, s3: 0,
            s4: 0, s5: 0, s6: 0, s7: 0,
            t8: 0, t9: 0, k0: 0, k1: 0,
            gp: 0, sp: 0, fp: 0, ra: 0,
            hi: 0, lo:0
        };
        memory = Array.from({ length: 32 }).reduce((acc, curr, i) => ({ ...acc, [i]: 0 }), {});

        // Update tables
        updateTables(registers, memory);

        // Update debugger info
        updateDebuggerInfo();
    }

    function updateDebuggerInfo() {
        debuggerInfo[0].textContent = `PC: ${PC}`;
        debuggerInfo[1].textContent = `Current instruction: ${mipsInput.value.trim().split('\n')[PC] ?? null}`;
        debuggerInfo[2].textContent = `Previous instruction: ${mipsInput.value.trim().split('\n')[PC - 1] ?? null}`;
    }

    // Función para activar los bloques del datapath
    function activateDatapathBlock(blockId) {
        // Primero, limpiamos todos los bloques activos
        document.querySelectorAll('.datapath-block').forEach(block => {
            block.classList.remove('active');
        });
        
        // Activamos el bloque específico
        const block = document.getElementById(blockId);
        if (block) {
            block.classList.add('active');
        }
    }

    // Función para simular la ejecución de una instrucción
    function simulateInstruction(instruction) {
        // Resetear todos los bloques
        document.querySelectorAll('.datapath-block').forEach(block => {
            block.classList.remove('active');
        });

        const inst = instruction.toLowerCase();
        console.log('Simulando instrucción:', inst);

        // Secuencia base (PC e Instruction Memory son comunes para todas las instrucciones)
        activateBlock('pc-block');
        
        setTimeout(() => {
            activateBlock('inst-mem-block');
        }, 500);

        // Instrucciones tipo-R (add, sub, and, or, slt)
        if (inst.startsWith('add ') || inst.startsWith('sub ') || 
            inst.startsWith('and ') || inst.startsWith('or ') || 
            inst.startsWith('slt ') || inst.startsWith('addu ') ||
            inst.startsWith('subu ') || inst.startsWith('mult ') ||
            inst.startsWith('multu ') || inst.startsWith('div ') ||
            inst.startsWith('divu ') || inst.startsWith('sllv ') ||
            inst.startsWith('srav ') || inst.startsWith('srlv ') ||
            inst.startsWith('xor ')) {
            console.log('Detectada instrucción tipo-R');
            // Lee dos registros fuente
            setTimeout(() => {
                activateBlock('registers-block');
            }, 1000);

            // Operación en ALU
            setTimeout(() => {
                activateBlock('alu-block');
            }, 1500);

            // Escribe resultado en registro destino
            setTimeout(() => {
                activateBlock('registers-block');
            }, 2000);
        }
        
        // Instrucciones tipo-I (addi, andi, ori, slti)
        else if (inst.startsWith('addi ') || inst.startsWith('andi ') || 
                 inst.startsWith('ori ') || inst.startsWith('slti ') ||
                 inst.startsWith('addiu ') || inst.startsWith('sll ') ||
                 inst.startsWith('sra ') || inst.startsWith('srl ') ||
                 inst.startsWith('xori ')) {
            console.log('Detectada instrucción tipo-I');
            // Lee un registro fuente
            setTimeout(() => {
                activateBlock('registers-block');
            }, 1000);

            // Operación en ALU con inmediato
            setTimeout(() => {
                activateBlock('alu-block');
            }, 1500);

            // Escribe resultado en registro destino
            setTimeout(() => {
                activateBlock('registers-block');
            }, 2000);
        }

        // Instrucciones de memoria (lw, sw)
        else if (inst.startsWith('lw ') || inst.startsWith('sw ')) {
            console.log('Detectada instrucción de memoria');
            // Lee registro base
            setTimeout(() => {
                activateBlock('registers-block');
            }, 1000);

            // Calcula dirección en ALU
            setTimeout(() => {
                activateBlock('alu-block');
            }, 1500);

            // Accede a memoria
            setTimeout(() => {
                activateBlock('data-mem-block');
            }, 2000);

            // Para lw, escribe en registro
            if (inst.startsWith('lw ')) {
                setTimeout(() => {
                    activateBlock('registers-block');
                }, 2500);
            }
        }

        // Instrucciones de salto (beq, bne)
        else if (inst.startsWith('beq ') || inst.startsWith('bne ')) {
            console.log('Detectada instrucción de salto');
            // Lee dos registros para comparar
            setTimeout(() => {
                activateBlock('registers-block');
            }, 1000);

            // Compara en ALU
            setTimeout(() => {
                activateBlock('alu-block');
            }, 1500);

            // El PC se actualiza si la condición es verdadera
            setTimeout(() => {
                activateBlock('pc-block');
            }, 2000);
        }


        else if (inst.startsWith('j ')) {
            console.log('Detectada instrucción de salto');
            // El PC se actualiza si la condición es verdadera
            setTimeout(() => {
                activateBlock('pc-block');
            }, 2000);
        }
    }

    function simulateMIPS() {
        // Get the value of the mipsInput textarea
        const instructions = mipsInput.value.trim().split('\n');
        
        // Simulate the first instruction
        if (instructions.length > 0) {
            simulateInstruction(instructions[0]);
        }

        // Scroll to the datapath section
        document.getElementById('datapath-section').scrollIntoView({ behavior: 'smooth' });

        // Resto del código existente...
    }

    // Modificar la función existente que maneja las instrucciones
    function handleInstruction(instruction) {
        // Tu código existente aquí
        
        // Añadir la simulación
        simulateInstruction(instruction);
    }
});

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        sum,
        translateInstructionToMIPS,
        translateInstructionToHex
    };
}

let lastActiveBlock = null;

function activateBlock(blockId) {
    console.log('Activando bloque:', blockId);
    // Primero removemos la clase active de todos los bloques
    document.querySelectorAll('.datapath-block').forEach(block => {
        block.classList.remove('active');
    });
    
    // Luego activamos el bloque específico
    const block = document.getElementById(blockId);
    if (block) {
        block.classList.add('active');
        console.log('Bloque activado:', blockId);
    } else {
        console.log('Bloque no encontrado:', blockId);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const instructionInput = document.getElementById('instruction-input');
    
    instructionInput.addEventListener('change', function() {
        const input = this.value.trim();
        if (input) {
            activateBlock('pc-block');
        }
    });
});

function translateHextoMIPS() {
    const input = document.getElementById('instruction-input').value.trim();
    if (!input) return;

    // Activar el bloque PC al recibir una nueva instrucción
    activateBlock('pc-block');

    const instructions = hexInput.value.trim().split('\n');

    // Translate each hexadecimal instruction to MIPS
    const translatedInstructions = instructions.map(instruction => {
        return translateInstructionToMIPS(instruction.trim());
    });

    // Join the translated instructions with a newline character
    const formattedInstructions = translatedInstructions.join('\n');

    // Set the value of the input textarea to the formatted instructions
    mipsInput.value = formattedInstructions;
}

document.addEventListener('DOMContentLoaded', function() {
    const translateButton = document.getElementById('translate-button');
    
    if (translateButton) {
        translateButton.addEventListener('click', function() {
            activateBlock('pc-block');
        });
    }
});

// Función para activar bloques
function activateBlock(blockId) {
    //console.log('Función activateBlock llamada para:', blockId); // Para debug
    const block = document.getElementById(blockId);
    if (block) {
        //console.log('Bloque encontrado, activando...'); // Para debug
        // Remover la clase active de todos los bloques
        document.querySelectorAll('.datapath-block').forEach(b => {
            b.classList.remove('active');
        });
        // Activar el nuevo bloque
        block.classList.add('active');
        //console.log('Bloque activado'); // Para debug
    } else {
        //console.log('Bloque no encontrado'); // Para debug
    }
}