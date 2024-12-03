function toLowerCaseString(text){
    return text.toLowerCase();
  }


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
        console.log("partes ",parts[0],parts[1])
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
    console.log("opcode",opcode);
    const opcodeMIPS = opcodeMap[opcode];
    if (!opcodeMIPS) return "Unknown Instruction, opcode null";

    let mipsInstruction = opcodeMIPS + " ";

    if (["add", "sub", "slt", "and", "or"].includes(opcodeMIPS)) {
        // R-type instruction
        const func = binaryInstruction.slice(26, 32);;
        //console.log("Instruction func ", func);
        const funcMIPS = funcMap[func];
        //console.log("Instruction ", funcMIPS);
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
        //console.log("I-type instruction, addi");
        const rt = regMap[binaryInstruction.slice(6, 11)];
        const rs = regMap[binaryInstruction.slice(11, 16)];
        // const immediate = parseInt(binaryInstruction.slice(16, 32), 16);
        //console.log('immediate ', binaryInstruction.slice(16, 32));
        //console.log('immediate formated ', binaryToHex(binaryInstruction.slice(16, 32)));
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
        var mipsInputs = toLowerCaseString(mipsInput.value.replace(/\$/g, ''));
        const hexInstructions = mipsInputs.trim().split('\n');
        // Initialize registers and memory
        resetMIPS();

        // Iterate over each hexadecimal instruction
        hexInstructions.forEach(instruction => {
            if (PC < hexInstructions.length) {
                executeMIPSInstruction(instruction, registers, memory);
                PC++;  // Increment PC after each instruction, unless modified by branch or jump
                console.log("PC updated to:", PC);
            }
        })

        // Display the final values of registers and memory
        console.log('Final Registers:', registers);
        console.log('Final Memory:', memory);

        // Update tables
        updateTables(registers, memory);
    }

    function executeMIPSInstruction(instruction, registers, memory) {
        // Split MIPS instruction into operation and operands
        const [op, ...operands] = instruction.split(' ');
        //var a = translateInstructionToHex(instruction);
        //console.log("instruction ",translateInstructionToMIPS(a));
        // Implement execution logic for each MIPS operation
        switch (op) {
            case 'add': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] + registers[rt];
                break;
            }
            case 'sub': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] - registers[rt];
                break;
            }
            case 'slt': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
                break;
            }
            case 'and': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] & registers[rt];
                break;
            }
            case 'or': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] | registers[rt];
                break;
            }
            case 'addi': {
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] + parseInt(immediate);
                break;
            }
            case 'lw': {
                //const [rt, rs, offset] = operands;
                const [rt, offset, rs] = operands;
                const address = registers[rs] + parseInt(offset);
                console.log('lw rt:', rt, 'rs', rs, 'offset', offset, 'address', address,'getting', registers[rt] );
                //console.log('lw address:', address);
                //console.log('lw memory value:', memory[address]);
                if (memory.hasOwnProperty(address)) {
                    registers[rt] = memory[address];
                } else {
                    console.error('Memory address not found:', address);
                }
                break;
            }
            case 'sw': {
                //const [rt, rs, offset] = operands;
                const [rt, offset, rs] = operands;
                const address = registers[rs] + parseInt(offset);
                console.log('sw rt:', rt, 'rs', rs, 'offset', offset, 'address', address,'getting', registers[rt] );
                memory[address] = registers[rt];
                break;
            }
            case 'j': {
                const jumpLine = parseInt(operands[0], 16);  
                stack.push(PC + 1);  
                PC = jumpLine-1;
                break;
            }
            case 'bne': {
                const [rs, rt, offset] = operands;
                if (registers[rs] !== registers[rt]) {
                    const branchOffset = parseInt(offset, 16);  
                    PC += branchOffset; 
                }
                break;
            }
            case 'beq': {
                const [rs, rt, offset] = operands;
                if (registers[rs] === registers[rt]) {
                    const branchOffset = parseInt(offset, 16);
                    PC += branchOffset;  
                }
                break;
            }
            // Add cases for other MIPS operations
            default: {
                console.error('Unsupported operation:', op);
                break;
            }
        }
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

    // Inicialización de botones del simulador
    const btnControlUnit = document.getElementById('btn-control-unit');
    const btnRegisters = document.getElementById('btn-registers');
    const btnPC = document.getElementById('btn-pc');
    const btnALUControl = document.getElementById('btn-alu-control');
    const btnALU = document.getElementById('btn-alu');
    const btnInstructionRegisters = document.getElementById('btn-inst-registers');

    // Función para actualizar el contenido de los botones
    function updateButtonContent(button, content) {
        if (button) {
            button.innerText = content;
        }
    }

    // Asignar eventos a los botones
    btnControlUnit.addEventListener('click', () => {
        doPartTwo(hexToBinary(translateInstructionToHex(currentInstruction))); // Procesa la instrucción actual
        updateButtonContent(btnControlUnit, JSON.stringify(controlUnit, null, 2));
    });

    btnRegisters.addEventListener('click', () => {
        updateButtonContent(btnRegisters, JSON.stringify(registers, null, 2));
    });

    btnPC.addEventListener('click', () => {
        updateButtonContent(btnPC, `PC: ${PC}`);
    });

    btnALUControl.addEventListener('click', () => {
        doPartThree(); // Procesa señales de la ALU
        updateButtonContent(btnALUControl, `ALU Control: ${ALURegUnitParts.outputAluC || "N/A"}`);
    });

    btnALU.addEventListener('click', () => {
        updateButtonContent(btnALU, `ALU Output: ${ALURegUnitParts.outALU || "N/A"}`);
    });

    btnInstructionRegisters.addEventListener('click', () => {
        updateButtonContent(btnInstructionRegisters, JSON.stringify(instructionParts, null, 2));
    });

    // Initialize the program counter (PC) and history stack
    // TODO: DEACTIVATE THE DEBUGGER WHEN COMPLETE THE SIMULATION, SINCE IT DOES NOT USE THE PROGRAM COUNTER
    let PC = 0;
    const history = [];
    let stack = [];
    updateDebuggerInfo();

    function stepMIPS() {


        // Get the value of the inputHex textarea and split it into instructions
        // set to lower case and remove $ if found
        var mipsInputs = toLowerCaseString(mipsInput.value.replace(/\$/g, ''));
        const hexInstructions = mipsInputs.trim().split('\n');

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
            //console.log('history ',history);
            //console.log('hexinstrucions ',hexInstructions);
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
      
      memory = Array.from({ length: 32 }).reduce((acc, curr, i) => ({ ...acc, [i]: 0 }), {});
      
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
      
      const instructionMap = {
          "add": { opcode: "000000", funct: "100000" },
          "sub": { opcode: "000000", funct: "100010" },
          "and": { opcode: "000000", funct: "100100" },
          "or": { opcode: "000000", funct: "100101" },
          "addi": { opcode: "001000" },
          "lw": { opcode: "100011" },
          "sw": { opcode: "101011" },
          "beq": { opcode: "000100" },
          "bne": { opcode: "000101" },
          "blez": { opcode: "000110" },
          "j": { opcode: "000010" },
          "jal": { opcode: "000011" }
        };
        
      // in binary
      var instructionParts = {
        "opcode": null,
        "rs": null,
        "rs": null,
        "rt": null,
        "rd": null,
        "funct": null,
        "imm": null
      }
      
      // binary signals of Control Unit (CU)
      var controlUnit = {
        "regdst" : null,
        "regwrite": null,
        "jump": null,
        "beq": null,
        "bne": null,
        "alusrc": null,
        "memtoreg": null,
        "memread": null,
        "memwrite": null,
        "aluop1": null,
        "aluop2": null,
      }
      
      // binary signals of RegUnit and ALU
      var ALURegUnitParts = {
        "ra":null,
        "rb":null,
        "rw":null,
        "busw":null,
        "raData":null,
        "rbData":null,
        "rbDataALU":null,
        "outALU":null,
        "outputAluC":null
      }
      
      //
      function updateParts(new_parts){
        for (const [key, value] of Object.entries(new_parts)) {
          instructionParts[key] = new_parts[key];
        }
      
      }
      
      //
      function resetParts() {
        for (const [key, value] of Object.entries(instructionParts)) {
          instructionParts[key] = null;
        }
      }
      
      //
      function resetControlUnit() {
        for (const [key, value] of Object.entries(controlUnit)) {
          controlUnit[key] = null;
        }
      }
      
      function resetALURegUnit() {
        for (const [key, value] of Object.entries(ALURegUnitParts)) {
          ALURegUnitParts[key] = null;
        }
      }
      
      
      function getOpcode(name){
        return instructionMap[name]?.opcode || 'unknown';
      }
      
      
      
      function getFunctCode(name) {
        return instructionMap[name]?.funct || 'unknown';
      }
      
      function convertOpCodeNameToCode(opcodeName) {
        return getOpcode(opcodeName);
      }
      
      function convertFunctToName(functBinary) {
        const name = Object.keys(instructionMap).find(
          key => instructionMap[key].funct === functBinary
        );
        return name || 'unknown';
      }
      
      function convertOpcodeToName(opcodeBinary){
        const name = Object.keys(instructionMap).find(
          key => instructionMap[key].opcode === opcodeBinary
        );
        return name || 'unknown';
      }
      
        function convertRegisterToBinary(registerName){
          const binary = Object.keys(registerMap).find(key => registerMap[key] === registerName);
          return binary || 'unknown';
        }
      
        function convertRegisterToName(registerBinary){
          return registerMap[registerBinary] ? `$${registerMap[registerBinary]}` : 'unknown';
        }
      
        function toLowerCaseString(text){
          return text.toLowerCase();
        }
      
        const registerMap = {
          "00000": "zero", "00001": "at", "00010": "v0", "00011": "v1",
          "00100": "a0", "00101": "a1", "00110": "a2", "00111": "a3",
          "01000": "t0", "01001": "t1", "01010": "t2", "01011": "t3",
          "01100": "t4", "01101": "t5", "01110": "t6", "01111": "t7",
          "10000": "s0", "10001": "s1", "10010": "s2", "10011": "s3",
          "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
          "11000": "t8", "11001": "t9", "11010": "k0", "11011": "k1",
          "11100": "gp", "11101": "sp", "11110": "fp", "11111": "ra"
        };
        
      
        function translateInstructionToHex(instruction){
          instruction = toLowerCaseString(instruction.replace(/\$/g, ''));
          const parts = instruction.split(' ');
          const opcode = getOpcode(parts[0]);
          if (opcode === 'unknown') return `Unknown Opcode for "${parts[0]}"`;
      
          let binaryInstruction = opcode;
      
          if (["add", "sub", "and", "or"].includes(parts[0])) {
            const rd = convertRegisterToBinary(parts[1]);
            const rs = convertRegisterToBinary(parts[2]);
            const rt = convertRegisterToBinary(parts[3]);
            if (!rd || !rs || !rt) return `Missing ${!rd ? ' rd' : ''}${!rs ? ' rs' : ''}${!rt ? ' rt' : ''}`;
            binaryInstruction += rs + rt + rd + "00000" + getFunctCode(parts[0]);
          } else if (["lw", "sw"].includes(parts[0])) {
            const rt = convertRegisterToBinary(parts[1]);
            const rs = convertRegisterToBinary(parts[3].split(',')[0]);
            const immediate = parseInt(parts[2]);
            if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
            binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
          } else if (["addi"].includes(parts[0])) {
            const rt = convertRegisterToBinary(parts[1]);
            const rs = convertRegisterToBinary(parts[2]);
            const immediate = parseInt(parts[3]);
            if (!rt || !rs || isNaN(immediate)) {
              return `Missing${!rt ? ' rt' : ''}${isNaN(immediate) ? ' immediate (hex)' : ''}${!rs ? ' rs' : ''}`;
            }
            binaryInstruction += rs + rt + (immediate >>> 0).toString(2).padStart(16, '0');
          } else if (["beq", "bne"].includes(parts[0])) {
            const rs = convertRegisterToBinary(parts[1]);
            const rt = ["beq", "bne"].includes(parts[0]) ? convertRegisterToBinary(parts[2]) : "00000";
            const label = parts[parts.length - 1];
            if (!rs || (["beq", "bne"].includes(parts[0]) && !rt)) return "Invalid Registers";
            const offset = parseInt(label);
            if (isNaN(offset)) return "Invalid Syntax";
            const offsetBinary = (offset >>> 0).toString(2).padStart(16, '0');
            binaryInstruction += rs + rt + offsetBinary;
          } else if (["j"].includes(parts[0])) {
            const address = parseInt(parts[1]);
            if (isNaN(address)) return "Invalid Syntax";
            binaryInstruction += (address >>> 0).toString(2).padStart(26, '0');
          } else {
            return "Unsupported Instruction";
          }
          //console.log("binary ",binaryInstruction);
          const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
          return hexInstruction;
        }
      
        function translateInstructionToMIPS(hexInstruction)  {
          if (hexInstruction.startsWith("0x")) {
            hexInstruction = hexInstruction.substring(2);
          }
          const binaryInstruction = hexToBinary(hexInstruction);
          const opcode = binaryInstruction.slice(0, 6);
          const opcodeMIPS = convertOpcodeToName(opcode);
          if (!opcodeMIPS) return "Unknown Instruction, opcode null";
      
          let mipsInstruction = opcodeMIPS + " ";
      
          if (["add", "sub", "slt", "and", "or"].includes(opcodeMIPS)) {
            const func = binaryInstruction.slice(26, 32);
            const funcMIPS = convertFunctToName(func);
            if (!funcMIPS) return "Unknown Instruction (function)";
      
            const rs = convertRegisterToName(binaryInstruction.slice(6, 11));
            const rt = convertRegisterToName(binaryInstruction.slice(11, 16));
            const rd = convertRegisterToName(binaryInstruction.slice(16, 21));
      
            if (["add", "sub", "slt", "and", "or", "addu", "subu", "xor", "nor", "srlv", "sllv", "srav"].includes(funcMIPS)) {
              mipsInstruction = funcMIPS + " " + rd + " " + rs + " " + rt;
            } else if (funcMIPS === "jr") {
              mipsInstruction = "jr " + rs;
            } else if (funcMIPS === "jalr") {
              mipsInstruction = "jalr " + rs + " " + rd;
            } else if (["sll", "srl", "sra"].includes(funcMIPS)) {
              const shamt = binaryToHex(binaryInstruction.slice(21, 26));
              mipsInstruction = funcMIPS + " " + rd + " " + rt + " " + shamt;
            } else if (["mult", "div", "multu", "divu"].includes(funcMIPS)) {
              mipsInstruction = funcMIPS + " " + rs + " " + rt;
            } else if (["mfhi", "mflo"].includes(funcMIPS)) {
              mipsInstruction = funcMIPS + " " + rd;
            } else if (["mthi", "mtlo"].includes(funcMIPS)) {
              mipsInstruction = funcMIPS + " " + rs;
            } else if (["tge", "tgeu", "tlt", "tltu", "teq", "tne"].includes(funcMIPS)) {
              const code = binaryToHex(binaryInstruction.slice(16, 26));
              mipsInstruction = funcMIPS + " " + rt + " " + rs + " " + code;
            }
          } else if (["tgei", "tgeiu", "tlti", "tltiu", "teqi", "tnei"].includes(opcodeMIPS)) {
            const rs = convertRegisterToName(binaryInstruction.slice(6, 11));
            const rt = binaryInstruction.slice(11, 16);
            const rtMap = {
              "01000": "tgei", "01001": "tgeiu", "01010": "tlti",
              "01011": "tltiu", "01100": "teqi", "01110": "tnei"
            };
            const instructionName = rtMap[rt];
            const immediate = binaryToHex(binaryInstruction.slice(16, 32));
            if (!instructionName || !rs || !immediate) return "Invalid Syntax";
            mipsInstruction = instructionName + " " + rs + " " + immediate;
          } else if (["lw", "sw", "lb", "lbu", "lh", "lhu", "sb", "sh"].includes(opcodeMIPS)) {
            const rs = convertRegisterToName(binaryInstruction.slice(6, 11));
            const rt = convertRegisterToName(binaryInstruction.slice(11, 16));
            const offset = binaryToHex(binaryInstruction.slice(16, 32));
            if (!rt || !rs || !offset) return "Invalid Syntax";
            mipsInstruction += rt + " " + offset + " " + rs;
          } else if (["addi", "addiu", "andi", "ori", "xori"].includes(opcodeMIPS)) {
            const rt = convertRegisterToName(binaryInstruction.slice(6, 11));
            const rs = convertRegisterToName(binaryInstruction.slice(11, 16));
            const immediate = binaryToHex(binaryInstruction.slice(16, 32));
            if (!rt || !rs || !immediate) return "Invalid Syntax";
            mipsInstruction += rs + " " + rt + " " + immediate;
          } else if (["beq", "bne", "bgtz", "blez"].includes(opcodeMIPS)) {
            const rs = convertRegisterToName(binaryInstruction.slice(6, 11));
            const rt = ["beq", "bne"].includes(opcodeMIPS) ? convertRegisterToName(binaryInstruction.slice(11, 16)) : "00000";
            const offset = binaryToHex(binaryInstruction.slice(16, 32));
            if (!rs || !offset) return "Invalid Registers or Syntax";
            if (opcodeMIPS === "bgtz" || opcodeMIPS === "blez") {
              mipsInstruction += rs + " " + offset;
            } else {
              mipsInstruction += rs + " " + rt + " " + offset;
            }
          } else if (["j", "jal"].includes(opcodeMIPS)) {
            const address = binaryToHex(binaryInstruction.slice(6, 32));
            if (!address) return "Invalid Syntax";
            mipsInstruction += address;
          } else {
            return "Unsupported Instruction";
          }
      
          return mipsInstruction;
        }
      
        function binaryToHex(binaryString){
          while (binaryString.length % 4 !== 0) {
            binaryString = '0' + binaryString;
          }
          let hexString = '';
          for (let i = 0; i < binaryString.length; i += 4) {
            const binaryChunk = binaryString.substring(i, i + 4);
            const hexDigit = parseInt(binaryChunk, 2).toString(16);
            hexString += hexDigit;
          }
          return "0x" + hexString.toUpperCase();
        }
      
        function hexToBinary(hex){
          let binary = '';
          for (let i = 0; i < hex.length; i++) {
            let bin = parseInt(hex[i], 16).toString(2);
            binary += bin.padStart(4, '0');
          }
          return binary;
        }
      
        function translateHextoMIPS(textInput){
          const instructions= textInput.trim().split('\n');
          const translatedInstructions = instructions.map(instruction => {
            return translateInstructionToMIPS(instruction.trim());
          });
          const formattedInstructions = translatedInstructions.join('\n');
          return formattedInstructions;
        }
      
        function translateMIPStoHex(textInput)  {
          const instructions = textInput.trim().split('\n');
          const translatedInstructions= instructions.map(instruction => {
            return translateInstructionToHex(instruction.trim());
          });
          const formattedInstructions = translatedInstructions.join('\n');
          return formattedInstructions;
        }
      
      // replicates logical NOT gate
      function NOT(input) {
        return Number(input === 0 || input === '0');
      }
      
      // functions that give signals of Control Unit
      function getRegdst(op){
        return NOT(op[2]) & NOT(op[3]) & NOT(op[4])
      }
      
      function getRegwrite(op){
        return (NOT(op[3]) & NOT(op[4])) || (NOT(op[2]) & NOT(op[3]) & op[5])
      }
      
      function getJump(op){
        return op[4] & NOT(op[5])
      }
      
      function getBeq(op){
        return op[3] & NOT(op[5])
      }
      
      function getBne(op){
        return op[5] & NOT(op[4])
      }
      
      function getAlusrc(op){
        return op[2] || (NOT(op[3]) & op[5])
      }
      
      function getMemtoreg(op){
        return NOT(op[2]) & NOT(op[3]) & op[5]
      }
      
      function getMemRead(op){
        return getMemtoreg(op)
      }
      
      function getMemwrite(op){
        return op[2] & op[5]
      }
      
      function getAluop1(op){
        return NOT(op[2]) & NOT(op[3]) & NOT(op[4])
      }
      
      function getAluop2(op){
        return op[3]
      }
      
      //salida de ALU de control
      function getControlALU(func,aluop1,aluop2){
        let left =  NOT(aluop1) | NOT(func[3])
        let right = (aluop1 || aluop2) & (aluop2 || func[4] || func[5])
        return String(left)+String(right)
      }
      
      // control unit signals
      function executeControlUnit(opcode){
        controlUnit["regdst"] = getRegdst(opcode);
        controlUnit["regwrite"] = getRegwrite(opcode);
        controlUnit["jump"] = getJump(opcode);
        controlUnit["beq"] = getBeq(opcode);
        controlUnit["bne"] = getBne(opcode);
        controlUnit["alusrc"] = getAlusrc(opcode);
        controlUnit["memtoreg"] = getMemtoreg(opcode);
        controlUnit["memread"] = getMemRead(opcode);
        controlUnit["memwrite"] = getMemwrite(opcode);
        controlUnit["aluop1"] = getAluop1(opcode);
        controlUnit["aluop2"] = getAluop2(opcode);
      }
      
      // replicates ALU signals
      function getALU(salida,raData,rbData){
        //10 suma, 11 resta, 00 and, 01 or
        switch(salida){
          case '10':
            return String(Number(raData)+Number(rbData));
          case '11':
            return String(Number(raData)-Number(rbData));
          case '00': // and
            return raData.split('').map((bit, index) => bit & rbData[index]).join('');
          case '01': //or
            return raData.split('').map((bit, index) => bit | rbData[index]).join('');
        }
      }
      
      //MUX of RegUnit to get RW
      function getMuxRegUnit(regdst,rt,rd){
        if(regdst=='0'){
          return rt;
        }else{
          return rd;
        }
      }
      
      // MUX of ALU 
      function getMuxALU(alusrc,imm,rbData){
        if(alusrc=='0'){
          return rbData;  
        }else{
          return '0'.repeat(16)+imm; // extendido a 32
        }
      }
      
      //MUX of Memory data: gives busW
      function getMUXMem(memtoreg,outALU,memoryData){
        if(memtoreg=='0'){
          return outALU;  
        }else{
          memoryData;
        }
      }
      
      function getParts(binary){
        instructionParts["opcode"] = binary.slice(0,6);
        instructionParts["rs"] = binary.slice(6,11);
        instructionParts["rt"] = binary.slice(11,16);
        instructionParts["rd"] = binary.slice(16,21);
        instructionParts["funct"] = binary.slice(25,31);
        instructionParts["imm"] = binary.slice(16,32);
        //console.log(instructionParts);
      }
      
      PC = 0;
      //Parte 1: muestra PC e instruccion 
      function doPartOne(HexInstruction){
        // recibe instruccion como HEX
        console.log("PC ",PC);
        console.log("Instruction Hex: ",HexInstruction);
        
      }
      //Parte 2: descomponer
      function doPartTwo(binaryInstruction){
        //obtener partes
        getParts(binaryInstruction);
        console.log(instructionParts);
      
        //obtener señales unidad de control
        console.log("Control Unit");
        executeControlUnit(instructionParts["opcode"]);
        console.log(controlUnit);
      
        let rs = instructionParts["rs"];
        let rt = instructionParts["rt"];
        let rd = instructionParts["rd"];
      
        // mux regunit 
        ALURegUnitParts["rw"] = getMuxRegUnit(controlUnit["regdst"],rt,rd);
        // unidad de registros
        ALURegUnitParts["ra"] = rs;
        ALURegUnitParts["rb"] = rt;
      
        ALURegUnitParts["raData"] = registers[regMap[rs]];
        ALURegUnitParts["rbData"] = registers[regMap[rt]];
      }
      
      // Parte 3
      function doPartThree(){
        // ALU control output
        console.log("RegUNit and ALU:")
        ALURegUnitParts["outputAluC"] = getControlALU(instructionParts["funct"],
                    controlUnit["aluop1"],controlUnit["aluop2"]);
      
        //mux alu: rbDataALU se opera con raData luego en ALU
        ALURegUnitParts["rbDataALU"] = getMuxALU(controlUnit["alusrc"],
                    instructionParts["imm"],ALURegUnitParts["rbData"]);
        //ALU
        ALURegUnitParts["outALU"] = getALU(ALURegUnitParts["outputAluC"], ALURegUnitParts["raData"],
                    ALURegUnitParts["rbDataALU"]);
        console.log(ALURegUnitParts);
      }
      
      
      // Parte 4
      function doPartFour(){
       // memoria datos
        memoryData = 
       // mux escritura
       ALURegUnitParts["busw"] = getMUXMem(controlUnit["memtoreg"],
                                ALURegUnitParts["outALU"],memoryData
       );
       // escritura a regunit
      }
      
      
      instruction = 'addi t0 t0 0x01';
      //instruction = 'lw t0 0x01 t2';
      hexI = translateInstructionToHex(instruction);
      bin = hexToBinary(hexI);
      console.log(bin);
      getParts(bin);
      
      doPartOne(hexI);
      doPartTwo(bin);
      doPartThree(); 
       
      
      console.log(memory); 
        
});





if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        sum,
        translateInstructionToMIPS,
        translateInstructionToHex
    };
}
