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

let PC = 0;
let sum1 = 0;
let gen_rs = 0
let gen_rt = 0
let gen_rd = 0
let gen_regdst = 0
let gen_offset = 0
let gen_jumpad = 0

let memory = {};

<<<<<<< HEAD
const img = document.getElementById('myImage');
const textOverlay = document.getElementById('description');

img.addEventListener('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    let text = '';
    let value = 0

    if (292 < x && x < 320 && 286 < y && y < 330) {
        text += `PC: ${PC}`;
    } else if (308 < x && x < 345 && 220 < y && y < 253) {
        text += `SUM1: ${sum1}`;
    } else if (445 < x && x < 473 && 300 < y && y < 310) {
        text += `RS: ${gen_rs}`;
    } else if (445 < x && x < 473 && 325 < y && y < 340) {
        text += `RT: ${gen_rt}`;
    } else if (445 < x && x < 473 && 358 < y && y < 372) {
        text += `RD: ${gen_rd}`;
    } else if (632 < x && x < 672 && 366 < y && y < 380) {
        text += `Offset: ${gen_offset}`;
    } else if (37 < x && x < 76 && 311 < y && y < 327) {
        text += `Offset: ${gen_offset}`;
    } else if (180 < x && x < 215 && 328 < y && y < 353) {
        text += `Jump: ${gen_offset}`;
    }

    //text+=` ${x} ${y}`

    textOverlay.textContent = text;
});

img.addEventListener('mouseleave', function () {
    textOverlay.textContent = 'Mueve el mouse sobre la imagen';
});
// MIPS Datapath Visualization
=======
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
class DatapathVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.components = {};
        this.signals = {};
<<<<<<< HEAD

        // Define component colors
=======
        
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
        this.componentColors = {
            MUX: '#FF9800',      
            PC: '#4CAF50',       
            ADDER: '#2196F3',    
            InstrMem: '#9C27B0', 
            Registers: '#E91E63', 
            ALU: '#00BCD4',      
            DataMem: '#9C27B0',  
            Constant: '#607D8B'   
        };

        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
        marker.setAttribute("id", "arrowhead");
        marker.setAttribute("markerWidth", "10");
        marker.setAttribute("markerHeight", "7");
        marker.setAttribute("refX", "9");
        marker.setAttribute("refY", "3.5");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("fill", "#2196F3");

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", "0 0, 10 3.5, 0 7");

        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);

        // Initialize the datapath
        this.initializeDatapath();
    }

    initializeDatapath() {
        const mainPathY = 150;  
        const spacing = 100;    

        this.createMux("MUX1", 100, mainPathY);
        this.createComponent("PC", 220, mainPathY, 60, 40);
        this.createComponent("InstrMem", 340, mainPathY, 80, 80);
        this.createComponent("Registers", 480, mainPathY, 100, 80);
        this.createMux("MUX2", 600, mainPathY);
        this.createComponent("ALU", 720, mainPathY, 80, 80);
        this.createComponent("DataMem", 840, mainPathY, 80, 80);
        this.createMux("MUX3", 960, mainPathY);

        this.createAdder("ADDER1", 220, mainPathY - 80);  // Above PC
        this.createAdder("ADDER2", 220, mainPathY + 80);  // Below PC
        this.createComponent("Constant", 340, mainPathY + 80, 40, 40);

        // Create signals in the correct order
        // Main datapath
        this.createSignal("MUX1-PC", "MUX1", "PC");
        this.createSignal("PC-InstrMem", "PC", "InstrMem");
        this.createSignal("InstrMem-Registers", "InstrMem", "Registers");
        this.createSignal("Registers-MUX2", "Registers", "MUX2");
        this.createSignal("MUX2-ALU", "MUX2", "ALU");
        this.createSignal("ALU-DataMem", "ALU", "DataMem");
        this.createSignal("DataMem-MUX3", "DataMem", "MUX3");

        // PC to ADDER1 and ADDER2
        this.createSignal("PC-ADDER1", "PC", "ADDER1", false, true);
        this.createSignal("PC-ADDER2", "PC", "ADDER2", false, true);

        // Constant to ADDER2
        this.createSignal("Constant-ADDER2", "Constant", "ADDER2");

        // Feedback paths
        this.createSignal("ADDER1-MUX1", "ADDER1", "MUX1", true);
        this.createSignal("ADDER2-MUX1", "ADDER2", "MUX1", true);

        // Additional control signals
        this.createSignal("InstrMem-MUX2", "InstrMem", "MUX2", false, true);
        this.createSignal("Registers-ALU", "Registers", "ALU", false, true);
        this.createSignal("ALU-MUX3", "ALU", "MUX3", false, true);
    }

    getComponentColor(name) {
        if (name.startsWith('MUX')) return this.componentColors.MUX;
        if (name.startsWith('ADDER')) return this.componentColors.ADDER;
        if (name === 'PC') return this.componentColors.PC;
        if (name === 'InstrMem') return this.componentColors.InstrMem;
        if (name === 'Registers') return this.componentColors.Registers;
        if (name === 'ALU') return this.componentColors.ALU;
        if (name === 'DataMem') return this.componentColors.DataMem;
        if (name === 'Constant') return this.componentColors.Constant;
        return '#2196F3'; // Default color
    }

    createComponent(name, x, y, width, height) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${x},${y})`);

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", width);
        rect.setAttribute("height", height);
        rect.setAttribute("x", -width / 2);
        rect.setAttribute("y", -height / 2);
        rect.setAttribute("rx", "5");
        rect.setAttribute("ry", "5");
        rect.setAttribute("fill", this.getComponentColor(name));
        rect.setAttribute("stroke", "white");
        rect.setAttribute("stroke-width", "2");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "0");
        text.setAttribute("y", "0");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "14px");
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

    createMux(name, x, y) {
        const width = 40;
        const height = 60;
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${x},${y})`);

        // Create trapezoid shape for multiplexer
        const points = [
            [-width / 2, -height / 2],  // Top left
            [width / 2, -height / 3],   // Top right
            [width / 2, height / 3],    // Bottom right
            [-width / 2, height / 2]    // Bottom left
        ].map(point => point.join(',')).join(' ');

        const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        polygon.setAttribute("points", points);
        polygon.setAttribute("fill", this.getComponentColor("MUX"));
        polygon.setAttribute("stroke", "white");
        polygon.setAttribute("stroke-width", "2");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "0");
        text.setAttribute("y", "0");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "14px");
        text.textContent = name;

        group.appendChild(polygon);
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

    createAdder(name, x, y) {
        const radius = 25;
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("transform", `translate(${x},${y})`);

        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("r", radius);
        circle.setAttribute("fill", this.getComponentColor("ADDER"));
        circle.setAttribute("stroke", "white");
        circle.setAttribute("stroke-width", "2");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", "0");
        text.setAttribute("y", "-5");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "14px");
        text.textContent = name;

        const plus = document.createElementNS("http://www.w3.org/2000/svg", "text");
        plus.setAttribute("x", "0");
        plus.setAttribute("y", "10");
        plus.setAttribute("text-anchor", "middle");
        plus.setAttribute("dominant-baseline", "middle");
        plus.setAttribute("fill", "white");
        plus.setAttribute("font-size", "18px");
        plus.setAttribute("font-weight", "bold");
        plus.textContent = "+";

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(plus);
        this.svg.appendChild(group);

        this.components[name] = {
            element: group,
            x: x,
            y: y,
            width: radius * 2,
            height: radius * 2
        };
    }

    createSignal(id, from, to, isFeedback = false, isSecondInput = false) {
        const fromComp = this.components[from];
        const toComp = this.components[to];
        if (!fromComp || !toComp) return;

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("class", "signal-path");
        path.setAttribute("stroke", "#2196F3");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("marker-end", "url(#arrowhead)");

        let startX, startY, endX, endY;
<<<<<<< HEAD

        // Output point (from)
        startX = fromComp.x + fromComp.width / 2;
=======
        
        startX = fromComp.x + fromComp.width/2;
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
        startY = fromComp.y;

        if (isSecondInput) {
            endX = toComp.x;
            endY = toComp.y + toComp.height / 2;
        } else {
<<<<<<< HEAD
            // Connect to left side for first input
            endX = toComp.x - toComp.width / 2;
=======
            endX = toComp.x - toComp.width/2;
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
            endY = toComp.y;
        }

        // Generate path data
        let d;
        if (isFeedback) {
            const midY = Math.min(fromComp.y, toComp.y) - 50;
            d = `M ${startX} ${startY} 
                 L ${startX} ${midY} 
                 L ${endX} ${midY} 
                 L ${endX} ${endY}`;
        } else if (isSecondInput) {
            const midX = (startX + endX) / 2;
            const bottomOffset = 30;
            d = `M ${startX} ${startY} 
                 L ${startX} ${endY + bottomOffset} 
                 L ${endX} ${endY + bottomOffset} 
                 L ${endX} ${endY}`;
        } else {
            const midX = (startX + endX) / 2;
            d = `M ${startX} ${startY} 
                 L ${midX} ${startY} 
                 L ${midX} ${endY} 
                 L ${endX} ${endY}`;
        }

        path.setAttribute("d", d);
        this.svg.insertBefore(path, this.svg.firstChild); 
        this.signals[id] = path;
    }

    highlightComponent(name, duration = 800) {
        const component = this.components[name];
        if (component) {
            const rect = component.element.querySelector("rect, polygon, circle");
            rect.setAttribute("fill", "#E3F2FD");
            rect.setAttribute("class", "highlight-component");

            setTimeout(() => {
                rect.setAttribute("fill", this.getComponentColor(name));
                rect.removeAttribute("class");
            }, duration);
        }
    }

    highlightSignal(id, duration = 800) {
        const signal = this.signals[id];
        if (signal) {
            signal.setAttribute("class", "signal-highlight animated");
            const length = signal.getTotalLength();
            signal.style.setProperty('--length', `${length}px`);

            setTimeout(() => {
                signal.setAttribute("class", "signal-path");
            }, duration);
        }
    }
}

// Register and Memory Visualization
class RegisterVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error('Register container not found:', containerId);
            return;
        }
        this.initializeRegisters();
    }

    initializeRegisters() {
        this.container.innerHTML = '';

        Object.keys(registers).forEach(reg => {
            const regItem = document.createElement('div');
            regItem.className = 'register-item';

            const regName = document.createElement('span');
            regName.className = 'register-name';
            regName.textContent = `$${reg}`;

            const regValue = document.createElement('span');
            regValue.className = 'register-value';
            regValue.id = `reg-${reg}`;
            regValue.textContent = '0x00000000';

            regItem.appendChild(regName);
            regItem.appendChild(regValue);
            this.container.appendChild(regItem);
        });
    }

    update(registers) {
        Object.entries(registers).forEach(([reg, value]) => {
            const element = document.getElementById(`reg-${reg}`);
            if (element) {
                const hexValue = (value >>> 0).toString(16).padStart(8, '0');
                element.textContent = `0x${hexValue}`;
            }
        });
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
                <span class="memory-address">0x${parseInt(address).toString(16).padStart(8, '0')} </span>
                <span class="memory-value">${this.formatValue(value, format)}</span>
            `;
            this.container.appendChild(memDiv);
        });
    }

    formatValue(value, format) {
        switch (format) {
            case 'hex':
                return ` 0x${value.toString(16).padStart(8, '0')}`;
            case 'decimal':
                return value.toString();
            case 'binary':
                return ` 0b${value.toString(2).padStart(32, '0')}`;
            default:
                return ` 0x${value.toString(16).padStart(8, '0')}`;
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
    const binary = parseInt(hexInstruction, 16).toString(2).padStart(32, '0');
<<<<<<< HEAD

    // Parse opcode (first 6 bits)
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
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
    const last = parseInt(binary.slice(26), 2);
    switch (opcode) {
        case 0x08: // addi
            return `addi ${registerNames[rt]} ${registerNames[rs]} 0x${immediate.toString(16).padStart(4, '0')}`;
        case 0x23: // lw
            return `lw ${registerNames[rt]} ${immediate} ${registerNames[rs]}`;
        case 0x2b: // sw
            return `sw ${registerNames[rt]} ${immediate} ${registerNames[rs]}`;
        case 0x02:
            return `j 0x${last.toString(16).padStart(7, '0')}`
        case 0x04:
            return `beq ${registerNames[rs]} ${registerNames[rt]} 0x${immediate.toString(16).padStart(4, '0')}`
        case 0x05:
            return `bne ${registerNames[rs]} ${registerNames[rt]} 0x${immediate.toString(16).padStart(4, '0')}`
        default:
            return `Unknown instruction: ${hexInstruction}`;
    }
}

<<<<<<< HEAD
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {
=======
document.addEventListener('DOMContentLoaded', function() {
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    console.log('DOM loaded, initializing simulator...');

    // Initialize visualizers
    datapathViz = new DatapathVisualizer(document.getElementById('datapath-container'));
    registerViz = new RegisterVisualizer('register-container');
    memoryViz = new MemoryVisualizer('memory-container');
<<<<<<< HEAD

    // Get UI elements
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
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

    if (elements.mipsInput) {
        elements.mipsInput.addEventListener('input', function () {
            instructions = this.value.trim().split('\n').filter(line => line.length > 0);
            updateExecutionStatus();
            console.log('Instructions updated:', instructions);
        });
    }

    if (elements.runButton) {
        elements.runButton.onclick = function () {
            console.log('Run button clicked');
            runSimulation();
        };
    }

    if (elements.stepButton) {
        elements.stepButton.onclick = function () {
            console.log('Step button clicked');
            stepSimulation();
        };
    }

    if (elements.resetButton) {
        elements.resetButton.onclick = function () {
            console.log('Reset button clicked');
            resetSimulation();
        };
    }

    if (elements.processFileButton && elements.fileInput) {
        elements.processFileButton.onclick = function () {
            console.log('Process file button clicked');
            elements.fileInput.click();
        };

        elements.fileInput.onchange = handleFileSelect;
    }

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

document.addEventListener('DOMContentLoaded', () => {
    const svgElement = document.querySelector('#datapath-container svg');
    if (svgElement) {
        window.datapathVisualizer = new DatapathVisualizer(svgElement);
    } else {
        console.error('SVG element not found');
    }
});

function runSimulation() {

    console.log('Running simulation...');
    resetSimulation();
<<<<<<< HEAD

    // Get instructions if not already loaded
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    const mipsInput = document.getElementById('mips-input');
    if (mipsInput && instructions.length === 0) {
        instructions = mipsInput.value.trim().split('\n').filter(line => line.length > 0);
        console.log('Loaded instructions:', instructions);
    }
<<<<<<< HEAD

    // Execute all instructions
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
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
<<<<<<< HEAD

    // Update execution status
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    const currentInstructionElement = document.getElementById('current-instruction');
    if (currentInstructionElement) {
        currentInstructionElement.textContent = instruction;
    }
<<<<<<< HEAD

    // Highlight datapath components based on instruction type
    highlightDatapath(instruction);

    // Execute instruction
    executeInstruction(instruction);

    // Update visualizations
    if (registerViz) registerViz.update(registers);
    if (memoryViz) memoryViz.update(memory);

    // Update program counter display
=======
    
    highlightDatapath(instruction);
    
    executeInstruction(instruction);
    
    if (registerViz) registerViz.update(registers);
    if (memoryViz) memoryViz.update(memory);
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    const pcValueElement = document.getElementById('pc-value');
    if (pcValueElement) {
        pcValueElement.textContent = `0x${(currentInstructionIndex * 4).toString(16).padStart(8, '0')}`;
    }

    currentInstructionIndex++;
    updateExecutionStatus();
}

function resetSimulation() {
    let PC = 0;
    let sum1 = 0;
    let gen_rs = 0
    let gen_rt = 0
    let gen_rd = 0
    let gen_regdst = 0
    let gen_offset = 0
    let gen_jumpad = 0
    console.log('Resetting simulation...');
    currentInstructionIndex = 0;
<<<<<<< HEAD

    // Reset registers
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    Object.keys(registers).forEach(key => {
        registers[key] = 0;
    });

    // Reset memory
    memory = {};
<<<<<<< HEAD

    // Update visualizations
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
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
<<<<<<< HEAD

    // Update instructions from input if it exists
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    if (elements.mipsInput) {
        instructions = elements.mipsInput.value.trim().split('\n').filter(line => line.length > 0);
    }

    updateExecutionStatus();
    console.log('Reset complete');
}

function executeInstruction(instruction) {
    console.log('Executing instruction:', instruction);
    const [op, ...operands] = instruction.split(' ');

    const [rs, rt, immediate] = operands;
    const immValue = parseInt(immediate, 16);

    PC = currentInstructionIndex * 4
    sum1 = PC + 4
    try {
        switch (op) {
            case 'j': {
                const [last] = operands;
                const lastValue = parseInt(last, 16);
                gen_jumpad = lastValue
                currentInstructionIndex = lastValue - 1;
                updateExecutionStatus();
                break;
            }
            case 'beq': {
                const [rs, rt, immediate] = operands;
                const immValue = parseInt(immediate, 16);
                gen_rs = rs
                gen_rt = rt
                gen_imm = immValue
                if (registers[rs] == registers[rt]) {
                    currentInstructionIndex = currentInstructionIndex + immValue
                }
                updateExecutionStatus();
                break;
            }
            case 'bne': {
                const [rs, rt, immediate] = operands;
                const immValue = parseInt(immediate, 16);
                gen_rs = rs
                gen_rt = rt
                gen_imm = immValue
                if (registers[rs] != registers[rt]) {
                    currentInstructionIndex = currentInstructionIndex + immValue

                }
                updateExecutionStatus();
                break;
            }
            case 'add': {
                const [rd, rs, rt] = operands;
                gen_rs = rs
                gen_rt = rt
                gen_rd = rd
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
                const immValue = parseInt(immediate, 16);
                gen_rs = rs
                gen_rt = rt
                gen_imm = immValue
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
                gen_rs = rs
                gen_rt = rt
                gen_rd = rd
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
                gen_rs = rs
                gen_rt = rt
                gen_offset = offset
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
                gen_rs = rs
                gen_rt = rt
                gen_offset = offset
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
    datapathViz.highlightSignal('PC-MUX1');
<<<<<<< HEAD

    // Highlight components based on instruction type
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    if (['lw', 'sw'].includes(op)) {
        datapathViz.highlightComponent('DataMem');
        datapathViz.highlightSignal('ALU-DataMem');
    }
    if (['add', 'sub'].includes(op)) {
        datapathViz.highlightComponent('ALU');
        datapathViz.highlightSignal('Registers-ALU');
    }
<<<<<<< HEAD

    // Always highlight registers for any instruction
=======
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
    datapathViz.highlightComponent('Registers');
}

function updateExecutionStatus() {
    const progress = `${currentInstructionIndex}/${instructions.length}`;
    const status = currentInstructionIndex >= instructions.length ? 'Complete' : 'Running';
<<<<<<< HEAD

    // Update UI elements to show progress
    const runButton = document.getElementById('simulate-mips-button');
    const stepButton = document.getElementById('step-button');

    // Only disable buttons if there are no instructions
=======
    
    const runButton = document.getElementById('simulate-mips-button');
    const stepButton = document.getElementById('step-button');
    
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
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

        const hexInstructions = lines[1].trim().split(/\s+/);
        instructions = hexInstructions.map(hex => translateInstructionToMIPS(hex.trim()));
<<<<<<< HEAD

        // Update the MIPS input area
        const mipsInput = document.getElementById('mips-input');
        if (mipsInput) mipsInput.value = instructions.join('\n');

        // Reset simulation state
        resetSimulation();

        // Update UI
=======
        
        const mipsInput = document.getElementById('mips-input');
        if (mipsInput) mipsInput.value = instructions.join('\n');
        
        resetSimulation();
        
>>>>>>> 69ed2a981b686470df50aa49b361cb93d1dbddb0
        updateExecutionStatus();
    };
    reader.readAsText(files[0]);
}
