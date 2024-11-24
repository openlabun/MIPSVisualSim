// volver mips a hexadecimal
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
    console.log("binary ",binaryInstruction);
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

//replica compuerta logica NOT
function NOT(input) {
  return Number(input === 0 || input === '0');
}

// funciones señales Unidad de Control
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

function getControlALU(func,aluop1,aluop2){
  let left =  NOT(aluop1) | NOT(func[3])
  let right = (aluop1 || aluop2) & (aluop2 || func[4] || func[5])
  return String(left)+String(right)
}

// replica señales emitidas por unidad de control
function executeControlUnit(opcode){
  console.log("regdst ",getRegdst(opcode));
  console.log("rewrite ",getRegwrite(opcode));
  console.log("jump ",getJump(opcode));
  console.log("beq ",getBeq(opcode));
  console.log("bne ",getBne(opcode));
  console.log("alusrc ",getAlusrc(opcode));
  console.log("memtoreg ",getMemtoreg(opcode));
  console.log("memread ",getMemRead(opcode));
  console.log("memwrite ",getMemwrite(opcode));
  console.log("aluop1 ",getAluop1(opcode));
  console.log("aluop2 ",getAluop2(opcode));
}

// replica salida de ALU
function getALU(salida,ra,rb){
  //10 suma, 11 resta, 00 and, 01 or
  switch(salida){
    case '10':
      return String(Number(ra)+Number(rb));
    case '11':
      return String(Number(ra)-Number(rb));
    case '00':
      return;
    case '01': //or
      return;
  }
}

instruction = 'j 0x01';
opcode = getOpcode(instruction.split(' ')[0])

console.log(opcode);

executeControlUnit(opcode);

//console.log(getALU('10','00001','00100'));