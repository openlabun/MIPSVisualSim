function translateInstructionToHex(instruction) {
    const opcodeMap = {
        "add": "000000", "sub": "000000", "slt": "000000", "and": "000000", "or": "000000",
        "addi": "001000", "lw": "100011", "sw": "101011",
        "beq": "000100", "bne": "000101",
        "j": "000010", "slti": "001010", "andi": "001100", "ori": "001101"
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

function translateInstructionToMIPS(hexInstruction) {
    console.log("hexInstruction", hexInstruction);
    const opcodeMap = {
        "000000": "add", "000000": "sub", "000000": "slt", "000000": "and", "000000": "or",
        "001000": "addi", "100011": "lw", "101011": "sw",
        "000100": "beq", "000101": "bne",
        "000010": "j", "slti": "001010", "andi": "001100", "ori": "001101"
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
    const mipsInput = document.getElementById('mips-input');
    const hexInput = document.getElementById('hex-input');
    const simulateMipsButton = document.getElementById('simulate-mips-button');
    const saveHexButton = document.getElementById('save-to-ram-button');
    const simulationTables = document.getElementById('simulation-tables');


    simulateMipsButton.addEventListener('click', simulateMIPS);


    // Get references to the drop area and the file input
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');



    const processFileButton = document.getElementById('process-file-button');
    processFileButton.addEventListener('click', function() {
        fileInput.click(); // Esto abrirá el diálogo de selección de archivos
    });

    // Agregar el event listener para cuando se seleccione un archivo
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }); 
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
        const dt = e.dataTransfer || { files: e.target.files };
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
            // Dividir el contenido en líneas y eliminar líneas vacías
            const lines = fileContent.split('\n').filter(line => line.trim());

            // Traducir cada instrucción y construir las instrucciones traducidas
            let translatedInstructions = '';
            let originalInstructions = '';

            lines.forEach(line => {
                const instruction = line.trim();
                if (instruction) {
                    // Convertir la instrucción MIPS a hexadecimal
                    const hexInstruction = translateInstructionToHex(instruction);
                    if (hexInstruction !== "Unknown Instruction" && hexInstruction !== "Invalid Syntax") {
                        originalInstructions += `${instruction}\n`;
                        translatedInstructions += `${hexInstruction}\n`;
                    }
                }
            });

            // Establecer el valor de los textareas
            mipsInput.value = originalInstructions.trim();
            hexInput.value = translatedInstructions.trim();

            console.log("Instrucciones originales:", originalInstructions);
            console.log("Instrucciones en hexadecimal:", translatedInstructions);
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
        hexInstructions.forEach(instruction => {
            executeMIPSInstruction(instruction, registers, memory);
        });

        // Display the final values of registers and memory
        console.log('Final Registers:', registers);
        console.log('Final Memory:', memory);

        // Update tables
        updateTables(registers, memory);
    }

    function eventVisible(instruction) {
        const [op, ...operands] = instruction.split(' ');
        const svgObject = document.querySelector('object[type="image/svg+xml"]');
    
        if (svgObject) {
            const svgDoc = svgObject.contentDocument;
            const allElements = ['PC', 'InsMem', 'Registers', 'AluCont', 'Alu', 'mux-aluSRC', 'muxRegDst', 'DataMem', 'muxBranch', 'muxPC'];
    
            // Paso 1: Limpiar popups y eventos anteriores
            allElements.forEach(id => {
                const element = svgDoc.getElementById(id);
                if (element) {
                    element.style.visibility = 'hidden';
                    // Eliminar eventos anteriores si existen
                    element.removeEventListener('mouseenter', element._mouseenterHandler);
                    element.removeEventListener('mouseleave', element._mouseleaveHandler);
                }
            });
    
            // Paso 2: Determinar los elementos a mostrar según la instrucción
            let elementsToShow = [];
            let popupTexts = [];
            console.log(registers[Object.keys(registers)[0]]);
            if (op === 'add' || op === 'sub' || op === 'and' || op === 'or' || op === 'slt') {
                elementsToShow = ['PC', 'InsMem', 'Registers', 'AluCont', 'Alu', 'mux-aluSRC'];
                popupTexts = [
                    `PC: ${PC}`,
                    `${instruction}`,
                    `Registers: ${(registers)}`,
                    `ALU Control: ${op}`,
                    `ALU: ${operands.join(', ')}`,
                    `MUX ALU Source: ${operands[2]}`
                ];
            } else if (op === 'addi' || op === 'andi' || op === 'ori' || op === 'slti') {
                elementsToShow = ['PC', 'InsMem', 'Registers', 'AluCont', 'Alu', 'mux-aluSRC', 'muxRegDst'];
                popupTexts = [
                    `PC: ${PC}`,
                    `${instruction}`,
                    `Registers: ${(registers)}`,
                    `ALU Control: ${op}`,
                    `ALU: ${operands.join(', ')}`,
                    `MUX ALU Source: ${operands[2]}`,
                    `MUX RegDst: ${operands[0]}`
                ];
            } else if (op === 'lw') {
                elementsToShow = ['PC', 'InsMem', 'Registers', 'mux-aluSRC', 'DataMem'];
                popupTexts = [
                    `PC: ${PC}`,
                    `${instruction}`,
                    `Registers: ${JSON.stringify(registers)}`,
                    `MUX ALU Source: ${operands[2]}`,
                    `Data Memory: ${(Object.values(memory))}`
                ];
            } else if (op === 'sw') {
                elementsToShow = ['PC', 'InsMem', 'Registers', 'mux-aluSRC', 'DataMem', 'Alu'];
                popupTexts = [
                    `PC: ${PC}`,
                    `${instruction}`,
                    `Registers: ${JSON.stringify(registers)}`,
                    `MUX ALU Source: ${operands[2]}`,
                    `Data Memory: ${(Object.values(memory))}`,
                    `ALU: ${operands.join(', ')}`
                ];
            } else if (op === 'beq' || op === 'bne') {
                elementsToShow = ['PC', 'Registers', 'Alu', 'mux-aluSRC', 'muxBranch'];
                popupTexts = [
                    `PC: ${PC}`,
                     `Registers: ${JSON.stringify(registers)}`,
                    `ALU: ${operands.join(', ')}`,
                    `MUX ALU Source: ${operands[2]}`,
                    `MUX Branch: ${op}`
                ];
            } else if (op === 'j') {
                elementsToShow = ['PC', 'InsMem', 'muxPC'];
                popupTexts = [
                    `PC: ${PC}`,
                    `${instruction}`,
                    `MUX PC: ${operands[0]}`
                ];
            }
            elementsToShow.forEach((id, index) => {
                const element = svgDoc.getElementById(id);
                if (element) {
                    element.style.visibility = 'visible';
    
                    element._mouseenterHandler = (event) => {
                        if (id === 'Registers') {
                            console.log("Estado actual de los registros:", registers);
                            // Formato especial para los registros
                            const registersText = [
                                'Temporales:',
                                ...['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9']
                                    .map(reg => `$${reg}: 0x${registers[reg].toString(16).padStart(8, '0')}`),
                                '',
                                'Salvados:',
                                ...['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7']
                                    .map(reg => `$${reg}: 0x${registers[reg].toString(16).padStart(8, '0')}`),
                                '',
                                'Argumentos:',
                                ...['a0', 'a1', 'a2', 'a3']
                                    .map(reg => `$${reg}: 0x${registers[reg].toString(16).padStart(8, '0')}`),
                                '',
                                'Otros:',
                                `$zero: 0x${registers.zero.toString(16).padStart(8, '0')}`,
                                `$ra: 0x${registers.ra.toString(16).padStart(8, '0')}`,
                                `$sp: 0x${registers.sp.toString(16).padStart(8, '0')}`,
                                `$fp: 0x${registers.fp.toString(16).padStart(8, '0')}`
                            ].join('\n');
                            showPopup(event, registersText);
                        } else {
                            showPopup(event, popupTexts[index]);
                        }
                    };
                    element._mouseleaveHandler = hidePopup;
    
                    element.addEventListener('mouseenter', element._mouseenterHandler);
                    element.addEventListener('mouseleave', element._mouseleaveHandler);
                }
            });
        }
    }

    function showAllElements() {
        var svgObject = document.querySelector('object[type="image/svg+xml"]');
        if (svgObject) {
            var svgDoc = svgObject.contentDocument;
            var allElements = ['PC', 'InsMem', 'Registers', 'AluCont', 'Alu', 'mux-aluSRC', 'muxRegDst', 'DataMem', 'muxBranch', 'muxPC'];
    
            // Show all elements
            allElements.forEach(id => {
                var element = svgDoc.getElementById(id);
                if (element) {
                    element.style.visibility = 'visible';
                }
            });
        } else {
            console.error('SVG object not found.');
        }
    }
    

    function executeMIPSInstruction(instruction, registers, memory) {
        // Split MIPS instruction into operation and operands
        const [op, ...operands] = instruction.split(' ');
        // Implement execution logic for each MIPS operation
        switch (op) {
            case 'add': {
                eventVisible(instruction);
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] + registers[rt];
                //
                break;
            }
            case 'sub': {
                eventVisible(instruction);
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] - registers[rt];
                break;
            }
            case 'slt': {
                eventVisible(instruction);
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] < registers[rt] ? 1 : 0;
                break;
            }
            case 'and': {
                eventVisible(instruction);
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] & registers[rt];
                break;
            }
            case 'or': {
                eventVisible(instruction);
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] | registers[rt];
                break;
            }
            case 'addi': {
                eventVisible(instruction);
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] + parseInt(immediate);
                break;
            }
            case 'andi': {
                eventVisible(instruction);
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] & parseInt(immediate);
                break;
            }
            case 'ori': {
                eventVisible(instruction);
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] | parseInt(immediate);
                break;
            }
            case 'slti': {
                console.log("slti");
                eventVisible(instruction);
                const [rd, rs, immediate] = operands;
                registers[rd] = registers[rs] < parseInt(immediate) ? 1 : 0;
                break;
            }
            case 'lw': {
                eventVisible(instruction);
                const [rt, rs, offset] = operands;
                const address = registers[rs] + parseInt(offset);
                if (memory.hasOwnProperty(address)) {
                    registers[rt] = memory[address];
                } else {
                    console.error('Memory address not found:', address);
                }
                break;
            }
            case 'sw': {
                eventVisible(instruction);
                const [rt, rs, offset] = operands;
                const address = registers[rs] + parseInt(offset);
                memory[address] = registers[rt];
                break;
            }
            case 'j': {
                eventVisible(instruction);
                const [address] = operands;
                console.log(PC)
                PC = parseInt(address) -1 ; // -1 because the PC will be incremented after the instruction is executed
                console.log(PC)
                break;
            }
            case 'beq': {
                eventVisible(instruction);
                const [rs, rt, offset] = operands;
                if (registers[rs] === registers[rt]) {
                    PC += parseInt(offset)-1;
                }
                break;
            }
            case 'bne': {
                eventVisible(instruction);
                const [rs, rt, offset] = operands;
                if (registers[rs] !== registers[rt]) {
                    PC += parseInt(offset)-1;
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
    debugResetButton.addEventListener('click', () => {
        resetMIPS();
        showAllElements();
    });
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
    let popup;
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM Content Loaded');
        // Crear el elemento popup si no existe
        
        if (!document.getElementById('popup')) {
            console.log('Creating popup element');
            popup = document.createElement('div');
            popup.id = 'popup';
            popup.style.position = 'absolute';
            popup.style.backgroundColor = 'white';
            popup.style.border = '1px solid black';
            popup.style.padding = '5px';
            popup.style.display = 'none';
            popup.style.pointerEvents = 'none';
            popup.style.zIndex = '1000';
            document.body.appendChild(popup);
            console.log('Popup element created and added to DOM');
        }
    });

    const svgObject = document.getElementById('mySvg');

    svgObject.addEventListener('load', () => {
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) {
            console.error('No se pudo acceder al documento SVG.');
            return;
        }

        const elementsWithPopups = {
            'PC': 'Program Counter',
            'InsMem': 'Instruction Memory',
            'Register': 'Registers',
            'AluCont': 'ALU Control',
            'Alu': 'Arithmetic Logic Unit',
            'mux-aluSRC': 'MUX ALU Source',
            'muxRegDst': 'MUX Register Destination',
            'DataMem': 'Data Memory',
            'muxBranch': 'MUX Branch',
            'muxPC': 'MUX Program Counter'
            // Añade más elementos y sus descripciones según sea necesario
        };

        // IDs de los elementos que deben mostrar un popup
        Object.keys(elementsWithPopups).forEach(id => {
            const element = svgDoc.getElementById(id);
            if (element) {
                element.addEventListener('mouseenter', (event) => {
                    showPopup(event, elementsWithPopups[id]);
                });
                element.addEventListener('mouseleave', hidePopup);
            }
        });
    });

    function createPopup() {
        popup = document.createElement('div');
        popup.id = 'popup';
        // Estilos básicos
        popup.style.position = 'fixed';
        popup.style.display = 'none';
        popup.style.zIndex = '99999'; // Valor muy alto para asegurar que esté por encima de todo
        
        // Estilos visuales
        popup.style.backgroundColor = '#333';
        popup.style.color = 'white';
        popup.style.padding = '8px 12px';
        popup.style.borderRadius = '4px';
        popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        popup.style.fontSize = '14px';
        popup.style.fontFamily = 'Arial, sans-serif';
        popup.style.minWidth = '100px';
        popup.style.maxWidth = '200px';
        
        // Asegurarse de que sea visible
        popup.style.opacity = '1';
        popup.style.visibility = 'visible';
        
        document.body.appendChild(popup);
        console.log('Popup created with enhanced styles');
        return popup;
    }

    function showPopup(event, text) {
        if (!popup) {
            popup = document.createElement('div');
            popup.id = 'popup';
            popup.style.position = 'absolute';
            popup.style.backgroundColor = 'white';
            popup.style.border = '1px solid black';
            popup.style.padding = '10px';
            popup.style.borderRadius = '5px';
            popup.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)';
            popup.style.fontSize = '14px';
            popup.style.fontFamily = 'monospace';
            popup.style.whiteSpace = 'pre';
            popup.style.maxHeight = '300px';
            popup.style.overflowY = 'auto';
            popup.style.display = 'none';
            popup.style.pointerEvents = 'none';
            popup.style.zIndex = '1000';
            document.body.appendChild(popup);
        }
        popup.textContent = text;
        
        const x = event.clientX + 15;
        const y = event.clientY + 15;
        popup.style.left = `${x}px`;
        popup.style.top = `${y}px`;
        popup.style.display = 'block';
    }
    
    function hidePopup() {
        if (popup) {
            popup.style.display = 'none';
        }
    }
    

    // Agregar estilos CSS globales
    const style = document.createElement('style');
    style.textContent = `
        #popup {
        position: fixed;
        background-color: white;
        color: black;
        padding: 15px 20px;        /* Padding más grande */
        border-radius: 6px;
        border: 1px solid #ccc;    /* Borde sutil */
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        font-size: 16px;           /* Texto más grande */
        font-family: Arial, sans-serif;
        min-width: 150px;          /* Ancho mínimo más grande */
        max-width: 250px;          /* Ancho máximo más grande */
        z-index: 99999;
        pointer-events: none;
        opacity: 1;
        visibility: visible;
    }
    `;
    document.head.appendChild(style);
});
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = {
        sum,
        translateInstructionToMIPS,
        translateInstructionToHex
    };
}
