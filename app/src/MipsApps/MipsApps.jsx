import React, { useState, useEffect } from "react";
import { Debugger } from "../Components";
import { DropArea } from "../Components";
import { ImageSelector } from "../utils/ImageSelector";
import "./MipsApps.css";
import { SimulationTables } from "../Components";
import CanvasManager from "./CanvasManager";
import CanvasProvider from "./CanvasContext";
import { ImageManager } from "./MipsAppsWithImages/ImageManager";
import { setAluResult } from "../utils/ALUResultStore";

const initialRegisters = {
  zero: 0,
  at: 0,
  v0: 0,
  v1: 0,
  a0: 0,
  a1: 0,
  a2: 0,
  a3: 0,
  t0: 0,
  t1: 0,
  t2: 0,
  t3: 0,
  t4: 0,
  t5: 0,
  t6: 0,
  t7: 0,
  s0: 0,
  s1: 0,
  s2: 0,
  s3: 0,
  s4: 0,
  s5: 0,
  s6: 0,
  s7: 0,
  t8: 0,
  t9: 0,
  k0: 0,
  k1: 0,
  gp: 0,
  sp: 0,
  fp: 0,
  ra: 0,
};

const initialMemory = Array.from({ length: 32 }).reduce(
  (acc, curr, i) => ({ ...acc, [i]: 0 }),
  {}
);

const MIPSApp = () => {
  const [mipsInput, setMipsInput] = useState("");
  const [hexInput, setHexInput] = useState("");
  const [registers, setRegisters] = useState(initialRegisters);
  const [memory, setMemory] = useState(initialMemory);
  const [PC, setPC] = useState(0);
  const [history, setHistory] = useState([]);
  const [currentInstruction, setCurrentInstruction] = useState("");
  const [images, setImages] = useState([]);
  const [currentImage, setCurrentImage] = useState("Base.png");
  const [time, setTime] = useState(1000);
  const [aluResult, setAluResult] = useState(0);
  useEffect(() => {
    setImages(ImageSelector(currentInstruction));
    setCurrentImage(images[0]);
  }, [currentInstruction, images]);
  const updateTables = (newRegisters, newMemory) => {
    setRegisters(newRegisters);
    setMemory(newMemory);
  };

  const simulateMIPS = () => {
    document
      .getElementById("simulation-tables")
      .scrollIntoView({ behavior: "smooth" });

    const hexInstructions = mipsInput.trim().split("\n");
    resetMIPS();

    const newRegisters = { ...initialRegisters };
    const newMemory = { ...initialMemory };

    hexInstructions.forEach((instruction) => {
      executeMIPSInstruction(instruction, newRegisters, newMemory);
    });

    updateTables(newRegisters, newMemory);
  };

  const stepMIPS = () => {
    const instructions = mipsInput.trim().split("\n");
    if (PC >= instructions.length) return;

    const newRegisters = { ...registers };
    const newMemory = { ...memory };

    setHistory([
      ...history,
      { PC, registers: { ...registers }, memory: { ...memory } },
    ]);

    setCurrentInstruction(instructions[PC]);
    const result = executeMIPSInstruction(
      instructions[PC],
      newRegisters,
      newMemory,
      PC
    );
    
    let newPc = PC + 1;

    if (result && result.newPC !== undefined) {
      newPc = result.newPC;
    }
    setPC(newPc);
    updateTables(newRegisters, newMemory);
  };

  const stepBackMIPS = () => {
    if (PC === 0) return;

    const lastState = history.pop();
    if (lastState) {
      setPC(lastState.PC);
      setRegisters(lastState.registers);
      setMemory(lastState.memory);
      setHistory(history.slice(0, -1));
      setCurrentInstruction(mipsInput.trim().split("\n")[lastState.PC]);
    }
  };

  const resetMIPS = () => {
    setPC(0);
    setHistory([]);
    setRegisters(initialRegisters);
    setMemory(initialMemory);
    setCurrentInstruction("");
  };
  const start = () => {
    setCurrentImage(images[0]);

    let i = 0;
    setInterval(() => {
      if (i < images.length) {
        setCurrentImage(images[i]);
        i++;
      }
    }, time);
  };
  return (
    <div>
      <header className=" w-full flex justify-center items-center bg-[var(--secondary-color)] text-[var(--white-color)] h-36 font-bold text-2xl">
        <h1>MIPS Visual Simulator</h1>
      </header>
      <section className="inputs-container">
        <div className="row-container">
          <textarea
            id="mips-input"
            className="input-text-area"
            value={mipsInput}
            onChange={(e) => setMipsInput(e.target.value)}
          />
        </div>
        <DropArea setMipsInput={setMipsInput} setHexInput={setHexInput} />
      </section>
      <h2 className=" ml-8 text-6xl font-bold">PC: {PC}</h2>
      <ImageManager image={currentImage} instruction={currentInstruction} />
      {/* If you want to use the canvas uncomment the following code and comment the last one*/}
      {/* <CanvasProvider>
        <section className="canvas-container">
          <CanvasManager value={currentInstruction} />
        </section>
      </CanvasProvider> */}

      <SimulationTables
        registers={registers}
        memory={memory}
        PC={PC}
        mipsInput={mipsInput}
        stepMIPS={stepMIPS}
        stepBackMIPS={stepBackMIPS}
        resetMIPS={resetMIPS}
        currentInstruction={currentInstruction}
        start={start}
        setTime={setTime}
      />
    </div>
  );
};
// MipsApps.jsx
export function executeMIPSInstruction(instruction, registers, memory, PC) {
  const [op, ...operands] = instruction.split(" ");
  let aluResult = 0;

  switch (op) {
    case "add": {
      const [rd, rs, rt] = operands;
      aluResult = registers[rs] + registers[rt];
      registers[rd] = aluResult;
      break;
    }
    case "sub": {
      const [rd, rs, rt] = operands;
      aluResult = registers[rs] - registers[rt];
      registers[rd] = aluResult;
      break;
    }
    case "slt": {
      const [rd, rs, rt] = operands;
      aluResult = registers[rs] < registers[rt] ? 1 : 0;
      registers[rd] = aluResult;
      break;
    }
    case "and": {
      const [rd, rs, rt] = operands;
      aluResult = registers[rs] & registers[rt];
      registers[rd] = aluResult;
      break;
    }
    case "or": {
      const [rd, rs, rt] = operands;
      aluResult = registers[rs] | registers[rt];
      registers[rd] = aluResult;
      break;
    }
    case "addi": {
      const [rd, rs, immediate] = operands;
      aluResult = registers[rs] + parseInt(immediate);
      registers[rd] = aluResult;
      break;
    }
    case "lw": {
      const [rt, offset, rs] = operands;

      const address = registers[rs] + parseInt(offset);
      if (memory.hasOwnProperty(address)) {
        aluResult = memory[address];
        registers[rt] = aluResult;
      } else {
        console.error("Memory address not found:", address);
      }
      break;
    }
    case "sw": {
      const [rt, offset, rs] = operands;
      
      const address = registers[rs] + parseInt(offset, 16);

      aluResult = registers[rt];
      memory[address] = aluResult;
      break;
    }
    case "j": {
      const [address] = operands;
      return { newPC: parseInt(address), aluResult };
    }
    case "beq": {
      const [rs, rt, offset] = operands;
      if (registers[rs] === registers[rt]) {
        return { newPC: PC + parseInt(offset), aluResult };
      }
      break;
    }
    case "bne": {
      const [rs, rt, offset] = operands;
      if (registers[rs] !== registers[rt]) {
        return { newPC: PC + parseInt(offset), aluResult };
      }
      break;
    }
    default: {
      console.error("Unsupported operation:", op);
      break;
    }
  }
  setAluResult(aluResult);
  return { aluResult };
}

export default MIPSApp;
