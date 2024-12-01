// Global variables for visualization
let datapathViz;
let registerViz;
let memoryViz;
let currentInstructionIndex = 0;
let instructions = [];
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
let memory = {};

// MIPS Datapath Visualization
class DatapathVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("width", "100%");
        this.svg.setAttribute("height", "100%");
        this.svg.setAttribute("viewBox", "0 0 800 400");
        this.container.appendChild(this.svg);
        this.components = {};
        this.signals = {};
        this.initializeDatapath();
    }

    initializeDatapath() {
        // Create basic MIPS components
        this.createComponent("PC", 50, 100, 60, 40);
        this.createComponent("InstrMem", 150, 100, 80, 60);
        this.createComponent("Registers", 300, 100, 100, 80);
        this.createComponent("ALU", 450, 100, 70, 70);
        this.createComponent("DataMem", 600, 100, 80, 60);
        this.createComponent("Control", 300, 20, 100, 40);

        // Create connections
        this.createSignal("PC-InstrMem", "PC", "InstrMem");
        this.createSignal("InstrMem-Registers", "InstrMem", "Registers");
        this.createSignal("Registers-ALU", "Registers", "ALU");
        this.createSignal("ALU-DataMem", "ALU", "DataMem");
    }

    createComponent(name, x, y, width, height) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        
        // Create rectangle
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("fill", "white");
        rect.setAttribute("stroke", "#2196F3");
        rect.setAttribute("stroke-width", "2");
        
        // Create text label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x + width/2);
        text.setAttribute("y", y + height/2);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "#333");
        text.textContent = name;
        
        group.appendChild(rect);
        group.appendChild(text);
        this.svg.appendChild(group);
        
        this.components[name] = {
            element: group,
            x: x,
            y: y,
            width: width,
            height: height
        };
    }

    createSignal(id, from, to) {
        const fromComp = this.components[from];
        const toComp = this.components[to];
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", fromComp.x + fromComp.width);
        line.setAttribute("y1", fromComp.y + fromComp.height/2);
        line.setAttribute("x2", toComp.x);
        line.setAttribute("y2", toComp.y + toComp.height/2);
        line.setAttribute("stroke", "#607D8B");
        line.setAttribute("stroke-width", "2");
        
        this.svg.insertBefore(line, this.svg.firstChild);
        this.signals[id] = line;
    }

    highlightComponent(name) {
        const component = this.components[name];
        if (component) {
            const rect = component.element.querySelector("rect");
            rect.setAttribute("fill", "#E3F2FD");
            setTimeout(() => rect.setAttribute("fill", "white"), 1000);
        }
    }

    highlightSignal(id) {
        const signal = this.signals[id];
        if (signal) {
            signal.setAttribute("stroke", "#2196F3");
            signal.setAttribute("stroke-width", "3");
            setTimeout(() => {
                signal.setAttribute("stroke", "#607D8B");
                signal.setAttribute("stroke-width", "2");
            }, 1000);
        }
    }
}

// Register and Memory Visualization
class RegisterVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.createRegisterGrid();
    }

    createRegisterGrid() {
        const registerNames = [
            'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
            't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
            's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
            't8', 't9', 'k0', 'k1', 'gp', 'sp', 'fp', 'ra'
        ];

        registerNames.forEach(name => {
            const regDiv = document.createElement('div');
            regDiv.className = 'register-item';
            regDiv.innerHTML = `
                <span class="register-name">${name}</span>
                <span class="register-value" id="reg-${name}">0x00000000</span>
            `;
            this.container.appendChild(regDiv);
        });
    }

    update(registers) {
        Object.entries(registers).forEach(([name, value]) => {
            const valueElement = document.getElementById(`reg-${name}`);
            if (valueElement) {
                valueElement.textContent = `0x${value.toString(16).padStart(8, '0')}`;
            }
        });
    }

    highlight(register) {
        const regElement = document.getElementById(`reg-${register}`);
        if (regElement) {
            regElement.classList.add('highlight');
            setTimeout(() => regElement.classList.remove('highlight'), 1000);
        }
    }
}

class MemoryVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.displayFormat = document.getElementById('memory-display-format');
        this.searchInput = document.getElementById('memory-search');
        this.memory = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.displayFormat) {
            this.displayFormat.addEventListener('change', () => this.updateDisplay());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('input', () => this.filterMemory());
        }
    }

    update(memory) {
        this.memory = memory;
        this.updateDisplay();
    }

    updateDisplay() {
        this.container.innerHTML = '';
        const format = this.displayFormat ? this.displayFormat.value : 'hex';
        
        Object.entries(this.memory).sort((a, b) => a[0] - b[0]).forEach(([address, value]) => {
            const memDiv = document.createElement('div');
            memDiv.className = 'memory-item';
            memDiv.innerHTML = `
                <span class="memory-address">0x${parseInt(address).toString(16).padStart(8, '0')}</span>
                <span class="memory-value">${this.formatValue(value, format)}</span>
            `;
            this.container.appendChild(memDiv);
        });
    }

    formatValue(value, format) {
        switch (format) {
            case 'hex':
                return `0x${value.toString(16).padStart(8, '0')}`;
            case 'decimal':
                return value.toString();
            case 'binary':
                return `0b${value.toString(2).padStart(32, '0')}`;
            default:
                return `0x${value.toString(16).padStart(8, '0')}`;
        }
    }

    filterMemory() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const items = this.container.getElementsByClassName('memory-item');
        
        Array.from(items).forEach(item => {
            const address = item.querySelector('.memory-address').textContent;
            item.style.display = address.toLowerCase().includes(searchTerm) ? '' : 'none';
        });
    }

    highlight(address) {
        const items = this.container.getElementsByClassName('memory-item');
        Array.from(items).forEach(item => {
            const itemAddress = item.querySelector('.memory-address').textContent;
            if (itemAddress === `0x${address.toString(16).padStart(8, '0')}`) {
                item.classList.add('highlight');
                setTimeout(() => item.classList.remove('highlight'), 1000);
            }
        });
    }
}

// Instruction translation functions
function translateInstructionToMIPS(hexInstruction) {
    // Convert hex string to binary
    const binary = parseInt(hexInstruction, 16).toString(2).padStart(32, '0');
    
    // Parse opcode (first 6 bits)
    const opcode = parseInt(binary.slice(0, 6), 2);
    
    const registerNames = [
        'zero', 'at', 'v0', 'v1', 'a0', 'a1', 'a2', 'a3',
        't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7',
        's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
        't8', 't9', 'k0', 'k1', 'gp', 'sp', 'fp', 'ra'
    ];
    
    // R-type instruction
    if (opcode === 0) {
        const rs = parseInt(binary.slice(6, 11), 2);
        const rt = parseInt(binary.slice(11, 16), 2);
        const rd = parseInt(binary.slice(16, 21), 2);
        const funct = parseInt(binary.slice(26), 2);
        
        switch (funct) {
            case 0x20: // add
                return `add ${registerNames[rd]} ${registerNames[rs]} ${registerNames[rt]}`;
            case 0x22: // sub
                return `sub ${registerNames[rd]} ${registerNames[rs]} ${registerNames[rt]}`;
            default:
                return `Unknown R-type instruction: ${hexInstruction}`;
        }
    }
    
    // I-type instruction
    const rs = parseInt(binary.slice(6, 11), 2);
    const rt = parseInt(binary.slice(11, 16), 2);
    const immediate = parseInt(binary.slice(16), 2);
    
    switch (opcode) {
        case 0x08: // addi
            return `addi ${registerNames[rt]} ${registerNames[rs]} 0x${immediate.toString(16).padStart(4, '0')}`;
        case 0x23: // lw
            return `lw ${registerNames[rt]} ${immediate} ${registerNames[rs]}`;
        case 0x2b: // sw
            return `sw ${registerNames[rt]} ${immediate} ${registerNames[rs]}`;
        default:
            return `Unknown instruction: ${hexInstruction}`;
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing simulator...');
    
    // Initialize visualizers
    datapathViz = new DatapathVisualizer('datapath-container');
    registerViz = new RegisterVisualizer('register-container');
    memoryViz = new MemoryVisualizer('memory-container');
    
    // Get UI elements
    const elements = {
        mipsInput: document.getElementById('mips-input'),
        runButton: document.getElementById('simulate-mips-button'),
        stepButton: document.getElementById('step-button'),
        resetButton: document.getElementById('reset-button'),
        processFileButton: document.getElementById('process-file-button'),
        fileInput: document.getElementById('fileInput'),
        dropArea: document.getElementById('dropArea')
    };

    console.log('Found buttons:', { 
        runButton: !!elements.runButton, 
        stepButton: !!elements.stepButton, 
        resetButton: !!elements.resetButton, 
        processFileButton: !!elements.processFileButton 
    });

    // Add input event listener to update instructions when text changes
    if (elements.mipsInput) {
        elements.mipsInput.addEventListener('input', function() {
            instructions = this.value.trim().split('\n').filter(line => line.length > 0);
            updateExecutionStatus();
            console.log('Instructions updated:', instructions);
        });
    }

    // Add button event listeners
    if (elements.runButton) {
        elements.runButton.onclick = function() {
            console.log('Run button clicked');
            runSimulation();
        };
    }

    if (elements.stepButton) {
        elements.stepButton.onclick = function() {
            console.log('Step button clicked');
            stepSimulation();
        };
    }

    if (elements.resetButton) {
        elements.resetButton.onclick = function() {
            console.log('Reset button clicked');
            resetSimulation();
        };
    }

    if (elements.processFileButton && elements.fileInput) {
        elements.processFileButton.onclick = function() {
            console.log('Process file button clicked');
            elements.fileInput.click();
        };
        
        elements.fileInput.onchange = handleFileSelect;
    }

    // File drag and drop handlers
    if (elements.dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            elements.dropArea.addEventListener(eventName, preventDefaults);
        });

        elements.dropArea.ondragenter = highlight;
        elements.dropArea.ondragover = highlight;
        elements.dropArea.ondragleave = unhighlight;
        elements.dropArea.ondrop = handleDrop;
    }

    // Initial reset
    resetSimulation();
});

function runSimulation() {
    console.log('Running simulation...');
    // Reset state before running
    resetSimulation();
    
    // Get instructions if not already loaded
    const mipsInput = document.getElementById('mips-input');
    if (mipsInput && instructions.length === 0) {
        instructions = mipsInput.value.trim().split('\n').filter(line => line.length > 0);
        console.log('Loaded instructions:', instructions);
    }
    
    // Execute all instructions
    while (currentInstructionIndex < instructions.length) {
        stepSimulation();
    }
    
    console.log('Simulation complete');
}

function stepSimulation() {
    console.log('Stepping simulation...', currentInstructionIndex, '/', instructions.length);
    
    if (currentInstructionIndex >= instructions.length) {
        console.log('No more instructions to execute');
        return;
    }

    const instruction = instructions[currentInstructionIndex];
    console.log('Executing instruction:', instruction);
    
    // Update execution status
    const currentInstructionElement = document.getElementById('current-instruction');
    if (currentInstructionElement) {
        currentInstructionElement.textContent = instruction;
    }
    
    // Highlight datapath components based on instruction type
    highlightDatapath(instruction);
    
    // Execute instruction
    executeInstruction(instruction);
    
    // Update visualizations
    if (registerViz) registerViz.update(registers);
    if (memoryViz) memoryViz.update(memory);
    
    // Update program counter display
    const pcValueElement = document.getElementById('pc-value');
    if (pcValueElement) {
        pcValueElement.textContent = `0x${(currentInstructionIndex * 4).toString(16).padStart(8, '0')}`;
    }
    
    currentInstructionIndex++;
    updateExecutionStatus();
}

function resetSimulation() {
    console.log('Resetting simulation...');
    currentInstructionIndex = 0;
    
    // Reset registers
    Object.keys(registers).forEach(key => {
        registers[key] = 0;
    });
    
    // Reset memory
    memory = {};
    
    // Update visualizations
    if (registerViz) registerViz.update(registers);
    if (memoryViz) memoryViz.update(memory);
    
    // Reset status displays
    const elements = {
        currentInstruction: document.getElementById('current-instruction'),
        pcValue: document.getElementById('pc-value'),
        aluResult: document.getElementById('alu-result'),
        mipsInput: document.getElementById('mips-input')
    };
    
    if (elements.currentInstruction) elements.currentInstruction.textContent = '-';
    if (elements.pcValue) elements.pcValue.textContent = '0x00000000';
    if (elements.aluResult) elements.aluResult.textContent = '-';
    
    // Update instructions from input if it exists
    if (elements.mipsInput) {
        instructions = elements.mipsInput.value.trim().split('\n').filter(line => line.length > 0);
    }
    
    updateExecutionStatus();
    console.log('Reset complete');
}

function executeInstruction(instruction) {
    console.log('Executing instruction:', instruction);
    const [op, ...operands] = instruction.split(' ');
    
    try {
        switch (op) {
            case 'add': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] + registers[rt];
                const result = registers[rd];
                console.log(`Add result: ${registers[rs]} + ${registers[rt]} = ${result}`);
                const aluResultElement = document.getElementById('alu-result');
                if (aluResultElement) {
                    aluResultElement.textContent = `0x${result.toString(16).padStart(8, '0')}`;
                }
                break;
            }
            case 'addi': {
                const [rt, rs, immediate] = operands;
                // Convert immediate from hex string to number
                const immValue = parseInt(immediate, 16);
                registers[rt] = registers[rs] + immValue;
                const result = registers[rt];
                console.log(`Addi result: ${registers[rs]} + ${immValue} = ${result}`);
                const aluResultElement = document.getElementById('alu-result');
                if (aluResultElement) {
                    aluResultElement.textContent = `0x${result.toString(16).padStart(8, '0')}`;
                }
                break;
            }
            case 'sub': {
                const [rd, rs, rt] = operands;
                registers[rd] = registers[rs] - registers[rt];
                const result = registers[rd];
                console.log(`Sub result: ${registers[rs]} - ${registers[rt]} = ${result}`);
                const aluResultElement = document.getElementById('alu-result');
                if (aluResultElement) {
                    aluResultElement.textContent = `0x${result.toString(16).padStart(8, '0')}`;
                }
                break;
            }
            case 'lw': {
                const [rt, offset, rs] = operands;
                const address = registers[rs] + parseInt(offset);
                registers[rt] = memory[address] || 0;
                console.log(`Load word: memory[${address}] = ${registers[rt]}`);
                const aluResultElement = document.getElementById('alu-result');
                if (aluResultElement) {
                    aluResultElement.textContent = `0x${address.toString(16).padStart(8, '0')}`;
                }
                break;
            }
            case 'sw': {
                const [rt, offset, rs] = operands;
                const address = registers[rs] + parseInt(offset);
                memory[address] = registers[rt];
                console.log(`Store word: memory[${address}] = ${registers[rt]}`);
                const aluResultElement = document.getElementById('alu-result');
                if (aluResultElement) {
                    aluResultElement.textContent = `0x${address.toString(16).padStart(8, '0')}`;
                }
                break;
            }
            default:
                console.error('Unknown instruction:', op);
        }
    } catch (error) {
        console.error('Error executing instruction:', instruction, error);
    }
}

function highlightDatapath(instruction) {
    const op = instruction.split(' ')[0];
    
    // Reset previous highlights
    datapathViz.highlightComponent('PC');
    datapathViz.highlightSignal('PC-InstrMem');
    
    // Highlight components based on instruction type
    if (['lw', 'sw'].includes(op)) {
        datapathViz.highlightComponent('DataMem');
        datapathViz.highlightSignal('ALU-DataMem');
    }
    if (['add', 'sub'].includes(op)) {
        datapathViz.highlightComponent('ALU');
        datapathViz.highlightSignal('Registers-ALU');
    }
    
    // Always highlight registers for any instruction
    datapathViz.highlightComponent('Registers');
}

function updateExecutionStatus() {
    const progress = `${currentInstructionIndex}/${instructions.length}`;
    const status = currentInstructionIndex >= instructions.length ? 'Complete' : 'Running';
    
    // Update UI elements to show progress
    const runButton = document.getElementById('simulate-mips-button');
    const stepButton = document.getElementById('step-button');
    
    // Only disable buttons if there are no instructions
    if (runButton) runButton.disabled = instructions.length === 0;
    if (stepButton) stepButton.disabled = instructions.length === 0;
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    const dropArea = document.getElementById('dropArea');
    if (dropArea) dropArea.classList.add('drag-over');
}

function unhighlight(e) {
    const dropArea = document.getElementById('dropArea');
    if (dropArea) dropArea.classList.remove('drag-over');
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
    unhighlight(e);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files.length === 0) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.trim().split('\n');
        
        if (lines.length < 2) {
            alert('Invalid file format. Expected at least two lines.');
            return;
        }

        // Process the second line containing instructions
        const hexInstructions = lines[1].trim().split(/\s+/);
        instructions = hexInstructions.map(hex => translateInstructionToMIPS(hex.trim()));
        
        // Update the MIPS input area
        const mipsInput = document.getElementById('mips-input');
        if (mipsInput) mipsInput.value = instructions.join('\n');
        
        // Reset simulation state
        resetSimulation();
        
        // Update UI
        updateExecutionStatus();
    };
    reader.readAsText(files[0]);
}