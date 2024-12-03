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

let memory = Array.from({ length: 32 }).reduce((acc, curr, i) => ({ ...acc, [i]: 0 }), {});

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

var PC = 0;
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
