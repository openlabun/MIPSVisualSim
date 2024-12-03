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
        const [offset, base] = parts[2].match(/(-?\d+)\((\w+)\)/).slice(1); // Parse offset(base)
        const rs = regMap[base];
        if (!rt || !rs || isNaN(offset)) return "Invalid Syntax";
        const immediate = (parseInt(offset) & 0xFFFF).toString(2).padStart(16, '0');
        binaryInstruction += rs + rt + immediate;
    } else if (["addi"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const immediate = (parseInt(parts[3]) & 0xFFFF).toString(2).padStart(16, '0');
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction += rs + rt + immediate;
    } else if (["beq", "bne"].includes(parts[0])) {
        // I-type instruction
        const rs = regMap[parts[1]];
        const rt = regMap[parts[2]];
        const offset = (parseInt(parts[3]) & 0xFFFF).toString(2).padStart(16, '0');
        if (!rs || !rt || isNaN(offset)) return "Invalid Syntax";
        binaryInstruction += rs + rt + offset;
    } else if (["j"].includes(parts[0])) {
        // J-type instruction
        const address = (parseInt(parts[1]) & 0x3FFFFFF).toString(2).padStart(26, '0');
        if (isNaN(address)) return "Invalid Syntax";
        binaryInstruction += address;
    } else {
        return "Unsupported Instruction";
    }

    // Convert binary instruction to hexadecimal
    return parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
}

function translateInstructionToMIPS(hexInstruction) {
    const opcodeMap = {
        "000000": "R-type",
        "001000": "addi", "100011": "lw", "101011": "sw",
        "000100": "beq", "000101": "bne",
        "000010": "j"
    };

    const funcMap = {
        "100000": "add", "100010": "sub", "101010": "slt", "100100": "and", "100101": "or",
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

    const binaryInstruction = parseInt(hexInstruction, 16).toString(2).padStart(32, '0');
    const opcode = binaryInstruction.slice(0, 6);
    const operation = opcodeMap[opcode];

    if (operation === "R-type") {
        const rs = binaryInstruction.slice(6, 11);
        const rt = binaryInstruction.slice(11, 16);
        const rd = binaryInstruction.slice(16, 21);
        const func = binaryInstruction.slice(26, 32);
        return `${funcMap[func]} ${regMap[rd]} ${regMap[rs]} ${regMap[rt]}`;
    } else if (["addi", "lw", "sw", "beq", "bne"].includes(operation)) {
        const rs = binaryInstruction.slice(6, 11);
        const rt = binaryInstruction.slice(11, 16);
        const immediate = parseInt(binaryInstruction.slice(16, 32), 2);
        return `${operation} ${regMap[rt]} ${regMap[rs]} ${immediate}`;
    } else if (operation === "j") {
        const address = parseInt(binaryInstruction.slice(6, 32), 2);
        return `${operation} ${address}`;
    } else {
        return "Unknown Instruction";
    }
}

function binaryToHex(binaryString) {
    while (binaryString.length % 4 !== 0) {
        binaryString = '0' + binaryString;
    }
    return parseInt(binaryString, 2).toString(16).toUpperCase().padStart(8, '0');
}

function hexToBinary(hex) {
    let binary = '';
    for (let i = 0; i < hex.length; i++) {
        binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
    }
    return binary;
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        translateInstructionToMIPS,
        translateInstructionToHex
    };
}


document.addEventListener('DOMContentLoaded', function () {
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




    function translateMIPStoHex() {
        const instructions = mipsInput.value.trim().split('\n');

        // Translate each MIPS instruction to hexadecimal
        const translatedInstructions = instructions.map(instruction => {
            return translateInstructionToHex(instruction.trim());
        });

        // Join the translated instructions with a newline character
        const formattedInstructions = translatedInstructions.join('\n');

        // Set the value of the inputHex textarea to the formatted instructions
        hexInput.value = formattedInstructions;
    }



    // Initialize registers and memory
    let registers = {
        zero: 0, at: 0, v0: 0, v1: 0,
        a0: 0, a1: 0, a2: 0, a3: 0,
        t0: 0, t1: 0, t2: 0, t3: 0,
        t4: 0, t5: 0, t6: 0, t7: 0,
        s0: 0, s1: 0, s2: 0, s3: 0,
        s4: 0, s5: 0, s6: 0, s7: 0,
        t8: 0, t9: 0, k0: 0, k1: 0,
        gp: 0, sp: 0, fp: 0, ra: 0
    };
    let memory = Array.from({ length: 32 }).reduce((acc, curr, i) => ({ ...acc, [i]: 0 }), {});

    // SIMULATION FUNCTIONS

    function simulateMIPS() {
        // Scroll to the simulation tables
        simulationTables.scrollIntoView({ behavior: 'smooth' });

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

     /*hexInstructions.forEach(instruction => {
         executeMIPSInstruction(instruction, registers, memory);
     });*/

     // Display the final values of registers and memory
     console.log('Final Registers:', registers);
     console.log('Final Memory:', memory);

     // Update tables
     updateTables(registers, memory);
 }

 function executeMIPSInstruction(instruction, registers, memory, PC) {
     //Simular recorrido
     console.log('current instruction: ', instruction);
     //const ID = descomponerMIPS(instruction);
     //console.log('Resultado ID:');
     //console.log(ID.resultado);
     //console.log('Resultado UC:');
     //console.log(ID.UC.control);
     //console.log('Resultado ALUC: ');
     //console.log(ID.UC.ALUC.aluOperation);
     //console.log('Resultado ALU: ');
     //console.log(ID.UC.ALUC.Alu.resultado)
     //console.log('Resultado ALU Zero: ');
     //console.log(ID.UC.ALUC.Alu.ZERO);




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
         case 'ori':{
             const [rd, rs, immediate] = operands;
             if(op=='andi'){
                 registers[rd] = registers[rs] & parseInt(immediate);
             }else{
                 registers[rd] = registers[rs] | parseInt(immediate);
             }
             PC++;

             break;
         }
         //FUNCIONA
         case 'or': {
             const [rd, rs, rt] = operands;
             registers[rd] = registers[rs] | registers[rt];
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
        const hexInstructions = mipsInput.value.trim().split('\n');

        if (PC >= hexInstructions.length)
            return;

        // Push the previous state to the history stack
        // TODO: This can be improved by only storing the changes in state
        history.push({ PC, registers: { ...registers }, memory: { ...memory } });

        // Execute the current instruction
        executeMIPSInstruction(hexInstructions[PC], registers, memory);

        // Increment the program counter (PC)
        PC++;

        // Check if the program has finished
        if (PC >= hexInstructions.length) {
            console.log('Program finished');
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
            gp: 0, sp: 0, fp: 0, ra: 0
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
});

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        sum,
        translateInstructionToMIPS,
        translateInstructionToHex
    };
}