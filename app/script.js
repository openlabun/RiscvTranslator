
// Function to convert operation to function code for R-type
function operationToFunctionCode(op) {
    const functCodes = {
        'add': ['0000000', '000'],
        'sub': ['0100000', '000'],
        'and': ['0000000', '111'],
        'or': ['0000000', '110'],
        'slt': ['0000000', '010'],
    };
    return functCodes[op] || 'unknown';
}



function convertOpCodeNameToCode(opcodeName) {
    const opcodeMap = {
        "add": "0110011", "sub": "0110011", "slt": "0110011", "and": "0110011", "or": "0110011",
        "addi": "0010011", "lw": "0000011", "sw": "0100011",
        "beq": "1100011", "bne": "1100011",
        "jal": "1101111"
    };
    return opcodeMap[opcodeName] || 'unknown';
}

function translateInstructionToHex(instruction) {

    const funcMap = {
        "add": ['0000000', '000'], 
        "sub": ['0100000', '000'], 
        "slt": ['0000000', '010'], 
        "and": ['0000000', '111'], 
        "or": ['0000000', '110'],
    };

    const regMap = {
        "zero": "00000", "ra": "00001", "sp": "00010", "gp": "00011",
        "tp": "00100", "t0": "00101", "t1": "00110", "t2": "00111",
        "s0": "01000", "s1": "01001", "a0": "01010", "a1": "01011",
        "a2": "01100", "a3": "01101", "a4": "01110", "a5": "01111",
        "a6": "10000", "a7": "10001", "s2": "10010", "s3": "10011",
        "s4": "10100", "s5": "10101", "s6": "10110", "s7": "10111",
        "s8": "11000", "s9": "11001", "s10": "11010", "s11": "11011",
        "t3": "11100", "t4": "11101", "t5": "11110", "t6": "11111"
    };

    instruction = instruction.replace(/\$/g, ''); // Remove the dollar sign from register names
    const parts = instruction.split(' ');

    const opcode = convertOpCodeNameToCode(parts[0]);
    if (!opcode) return "Unknown Instruction";

    let binaryInstruction;
    console.log(parts[0]);
    if (["add", "sub", "slt", "and", "or"].includes(parts[0])) {
        // R-type instruction
        const rd = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const rt = regMap[parts[3]];
        if (!rd || !rs || !rt) return "Invalid Registers";
        binaryInstruction = funcMap[parts[0]][0] + rt + rs + funcMap[parts[0]][1]+ rd +  opcode;
    } else if (parts[0]==="lw") {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[3].split(',')[0]];
        const immediate = parseInt(parts[2]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction =  (immediate >>> 0).toString(2).padStart(12, '0') + rs + "010"  + rt+ opcode;
    } else if (parts[0]==="sw") {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[3].split(',')[0]];
        let immediate = parseInt(parts[2]);
        immediate = (immediate >>> 0).toString(2).padStart(12, '0')
        
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction =  immediate.substring(0,7) + rt + rs + "010"  + immediate.substring(7,12)+ opcode;
    } else if (["addi"].includes(parts[0])) {
        // I-type instruction
        const rt = regMap[parts[1]];
        const rs = regMap[parts[2]];
        const immediate = parseInt(parts[3]);
        if (!rt || !rs || isNaN(immediate)) return "Invalid Syntax";
        binaryInstruction =  (immediate >>> 0).toString(2).padStart(12, '0') + rs + "000"  + rt+ opcode;
    } else if (["beq", "bne"].includes(parts[0])) {
        // I-type instruction
        const rs = regMap[parts[1]];
        const rt = regMap[parts[2]];
        const label = parts[3];
        const immediate = (label >>> 0).toString(2).padStart(12, '0')
        if (!rs || !rt) return "Invalid Registers";
        // For simplicity, assuming label is an immediate value (offset)
        const offset = parseInt(label);
        if (isNaN(offset)) return "Invalid Syntax";
        const functio = (parts[0]==="beq")?  "000":"001"
        binaryInstruction =  "0"+immediate.substring(1,7) + rt + rs + functio  + immediate.substring(7,11)+ immediate.substring(0,1) +opcode;
    } else if (["jal"].includes(parts[0])) {
        // J-type instruction
        const rd = regMap[parts[1]];
        const address = parseInt(parts[2]);
        const immediate = (address >>> 0).toString(2).padStart(21, '0')
        if (isNaN(address)) return "Invalid Syntax";
        binaryInstruction = immediate.substring(0,1)+immediate.substring(10,20)+ immediate.substring(9,10)+ immediate.substring(1,9)+rd+opcode;
    } else {
        return "Unsupported Instruction";
    }

    // Convert binary instruction to hexadecimal
    const hexInstruction = parseInt(binaryInstruction, 2).toString(16).toUpperCase().padStart(8, '0');
    //return "0x" + hexInstruction;
    return hexInstruction;
}

function convertRegisterToName(registerBinary) {
    const regMap ={
        "00000": "zero", "00001": "ra", "00010": "sp", "00011": "gp",
        "00100": "tp", "00101": "t0", "00110": "t1", "00111": "t2",
        "01000": "s0", "01001": "s1", "01010": "a0", "01011": "a1",
        "01100": "a2", "01101": "a3", "01110": "a4", "01111": "a5",
        "10000": "a6", "10001": "a7", "10010": "s2", "10011": "s3",
        "10100": "s4", "10101": "s5", "10110": "s6", "10111": "s7",
        "11000": "s8", "11001": "s9", "11010": "s10", "11011": "s11",
        "11100": "t3", "11101": "t4", "11110": "t5", "11111": "t6"
    }
    return regMap[registerBinary] || 'unknown';
}

function convertFunctToName(functBinary) {
    const funcMap = {
        '0000000, 000': 'add',
        '0100000, 000': 'sub',
        '0000000, 111': 'and',
        '0000000, 110': 'or',
        '0000000, 010': 'slt'
    };
    
    return funcMap[functBinary] || 'unknown';
}

function convertOpcodeToName(opcodeBinary) {
    const opcodeMap = {
        "0110011": "r",
        "0010011": "addi",
        "0000011": "lw",
        "0100011": "sw",
        "1100011": "beq/bne",
        "1101111": "jal"
    }
    

    return opcodeMap[opcodeBinary] || 'unknown';
}



function translateInstructionToRISCV(hexInstruction) {
    console.log("hexInstruction", hexInstruction);

    const binaryInstruction = hexToBinary(hexInstruction);
    const opcode = binaryInstruction.slice(25, 32);
    console.log(opcode);
    const opcodeRISCV = convertOpcodeToName(opcode);
    if (!opcodeRISCV) return "Unknown Instruction, opcode null";

    let RISCVInstruction = opcodeRISCV + " ";

    if (opcodeRISCV==="r") {
        // R-type instruction
        const func = binaryInstruction.slice(0, 7)+ ", "+ binaryInstruction.slice(17,20);
        console.log("Instruction func ", func);
        const funcRISCV = convertFunctToName(func);
        console.log("Instruction ", funcRISCV);
        if (!funcRISCV) return "Unknown Instruction (function)";
        RISCVInstruction = funcRISCV + " ";
        const rs = convertRegisterToName(binaryInstruction.slice(12, 17));
        const rt = convertRegisterToName(binaryInstruction.slice(7, 12));
        const rd = convertRegisterToName(binaryInstruction.slice(20, 25));
        if (!rs || !rt || !rd) return "Invalid Registers";
        RISCVInstruction += rd + " " + rs + " " + rt;
    } else if (["lw", "addi"].includes(opcodeRISCV)) {
        // I-type instruction
        const rt = convertRegisterToName(binaryInstruction.slice(20, 25));
        const rs = convertRegisterToName(binaryInstruction.slice(12, 17));
        const offset = binaryInstruction.slice(0, 12);
        console.log('lw, sw offset ', binaryToHex(offset));
        if (!rt || !rs || isNaN(offset)) return "Invalid Syntax";
        RISCVInstruction += rs + " " + rt + " " + binaryToHex(offset);
    } else if (opcodeRISCV==="sw") {
        // I-type instruction
        const rt = convertRegisterToName(binaryInstruction.slice(7, 12));
        const rs = convertRegisterToName(binaryInstruction.slice(12, 17));
        const offset = binaryInstruction.slice(0, 7)+binaryInstruction.slice(20, 25) ;
        console.log('lw, sw offset ', binaryToHex(offset));
        if (!rt || !rs || isNaN(offset)) return "Invalid Syntax";
        RISCVInstruction += rs + " " + rt + " " + binaryToHex(offset);
    } else if (opcodeRISCV === "beq/bne") {
        // I-type instruction
        RISCVInstruction = binaryInstruction.slice(17, 20)==="000"?"beq ":"bne ";
        const rs = convertRegisterToName(binaryInstruction.slice(12, 17));
        const rt = convertRegisterToName(binaryInstruction.slice(7, 12));
        const offset = binaryInstruction.slice(0, 1)+binaryInstruction.slice(1, 7)+binaryInstruction.slice(20, 24)+"0";
        if (!rs || !rt || isNaN(offset)) return "Invalid Syntax";
        // For simplicity, assuming label is an immediate value (offset)
        RISCVInstruction += rs + " " + rt + " " + binaryToHex(offset);
    } else if (opcodeRISCV==="jal") {
        // J-type instruction
        const rd = convertRegisterToName(binaryInstruction.slice(20, 25));
        const address = binaryInstruction.slice(0, 1)+binaryInstruction.slice(12, 20)+binaryInstruction.slice(11, 12)+binaryInstruction.slice(1, 11)+ "0";
        if (isNaN(address)) return "Invalid Syntax";
        RISCVInstruction += rd+" "+binaryToHex(address);
    } else {
        return "Unsupported Instruction opcode", opcodeRISCV;
    }

    return RISCVInstruction;
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
    const RISCVInput = document.getElementById('mips-input');
    const hexInput = document.getElementById('hex-input');
    const explainInput = document.getElementById('instruction-explanation-input');
    const RISCVToHexButton = document.getElementById('mips-to-hex-button');
    const hexToRISCVButton = document.getElementById('hex-to-mips-button');
    const simulateRISCVButton = document.getElementById('simulate-mips-button');
    const explainButton = document.getElementById('explain-button');
    const saveHexButton = document.getElementById('save-to-ram-button');
    const simulationTables = document.getElementById('simulation-tables');
    const debugButton = document.getElementById('start-debug');
    const explanationDiv = document.getElementById('instruction-explanation');

    RISCVToHexButton.addEventListener('click', translateRISCVtoHex);
    hexToRISCVButton.addEventListener('click', translateHextoRISCV);
    simulateRISCVButton.addEventListener('click', simulateRISCV);
    saveHexButton.addEventListener('click', saveHexToFile);
    debugButton.addEventListener('click', startDebug);
    explainButton.addEventListener('click', explainInstruction);

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
                const translated = translateInstructionToRISCV(instruction.trim());
                translatedInstructions += `${translated}\n`;
                originalInstructions += `${instruction.trim()}\n`;
            });

            // Set the value of input textarea with translated instructions
            RISCVInput.value = translatedInstructions.trim();
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
        anchor.download = 'RISCV_instructions.hex';
        anchor.href = window.URL.createObjectURL(blob);
        anchor.click();
    }



    function translateHextoRISCV() {
        const instructions = hexInput.value.trim().split('\n');

        // Translate each hexadecimal instruction to RISCV
        const translatedInstructions = instructions.map(instruction => {
            return translateInstructionToRISCV(instruction.trim());
        });

        // Join the translated instructions with a newline character
        const formattedInstructions = translatedInstructions.join('\n');

        // Set the value of the input textarea to the formatted instructions
        RISCVInput.value = formattedInstructions;
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




    function translateRISCVtoHex() {
        const instructions = RISCVInput.value.trim().split('\n');

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

    function simulateRISCV() {
        // !Hide the debugger cause' it use PC and the simulation does not (may cause conflicts)
        hideDebugger();

        // Scroll to the simulation tables
        simulationTables.scrollIntoView({ behavior: 'smooth' });

        // Get the value of the inputHex textarea and split it into instructions
        const hexInstructions = RISCVInput.value.trim().split('\n');
        // Initialize registers and memory
        resetRISCV();
        // Iterate over each hexadecimal instruction
        hexInstructions.forEach(instruction => {
            executeRISCVInstruction(instruction, registers, memory);
        });

        // Display the final values of registers and memory
        console.log('Final Registers:', registers);
        console.log('Final Memory:', memory);

        // Update tables
        updateTables(registers, memory);
    }

    function executeRISCVInstruction(instruction, registers, memory) {
        // Split RISCV instruction into operation and operands
        const [op, ...operands] = instruction.split(' ');
        // Implement execution logic for each RISCV operation
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
                const [rt, rs, offset] = operands;
                const address = registers[rs] + parseInt(offset);
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
                const [rt, rs, offset] = operands;
                const address = registers[rs] + parseInt(offset);
                //console.log('sw rt:', rt, 'rs', rs, 'offset', offset, 'address', address,'getting', registers[rt] );
                memory[address] = registers[rt];
                break;
            }
            // Add cases for other RISCV operations
            default: {
                console.error('Unsupported operation:', op);
                break;
            }
        }
    }

    function startDebug() {
        resetRISCV();
        showDebugger();

        // Scroll to the simulation tables
        simulationTables.scrollIntoView({ behavior: 'smooth' });
    }

    // SETUP THE DEBUGGER
    const debugPlayButton = document.getElementById('dg-run-button');
    const debugStepButton = document.getElementById('dg-step-in-button');
    const debugBackButton = document.getElementById('dg-step-over-button');
    const debugResetButton = document.getElementById('dg-reset-button');
    const debugr = document.getElementById('debugger');
    const debuggerInfo = document.querySelectorAll('#debugger-info>p');

    debugPlayButton.addEventListener('click', simulateRISCV);
    debugStepButton.addEventListener('click', stepRISCV);
    debugBackButton.addEventListener('click', stepBackRISCV);
    debugResetButton.addEventListener('click', resetRISCV);
    RISCVInput.addEventListener('input', updateDebuggerInfo);

    function showDebugger() {
        if (debugr.classList.contains('hidden')) {
            debugr.classList.remove('hidden');
        }
    }

    function hideDebugger() {
        if (!debugr.classList.contains('hidden')) {
            debugr.classList.add('hidden');
        }
    }

    // Initialize the program counter (PC) and history stack
    let PC = 0;
    const history = [];
    updateDebuggerInfo();

    // TODO: Highlight the changed registers and memory cells
    function stepRISCV() {

        // Get the value of the inputHex textarea and split it into instructions
        const hexInstructions = RISCVInput.value.trim().split('\n');

        if (PC >= hexInstructions.length)
            return;

        // Push the previous state to the history stack
        // TODO: This can be improved by only storing the changes in state
        history.push({ PC, registers: { ...registers }, memory: { ...memory } });

        // Execute the current instruction
        executeRISCVInstruction(hexInstructions[PC], registers, memory);

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

    function stepBackRISCV() {
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

    function resetRISCV() {
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
        debuggerInfo[1].textContent = `Current instruction: ${RISCVInput.value.trim().split('\n')[PC] ?? null}`;
        debuggerInfo[2].textContent = `Previous instruction: ${RISCVInput.value.trim().split('\n')[PC - 1] ?? null}`;
    }

    function explainInstruction() {
        const instruction = explainInput.value.trim();
        //const explanation = decodeInstruction(instruction.trim());
        generateInstructionTable(instruction.trim());
        //explanationDiv.textContent = explanation;
        //explanationDiv.style.display = 'block'; // Show the explanation
    }

    function produceRInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const parts = {
            funct7: binaryInstruction.slice(0, 7),
            rs2: binaryInstruction.slice(7, 12),
            rs1: binaryInstruction.slice(12, 17),
            funct3: binaryInstruction.slice(17, 20),
            rd: binaryInstruction.slice(20, 25),
            opcode: binaryInstruction.slice(25, 32),
        };

        // Create the table structure
        let tableHtml = `
        <table class="mips-table">
        <tr>
            <th colspan="6">31-25</th>
            <th colspan="5">24-20</th>
            <th colspan="5">19-15</th>
            <th colspan="5">14-12</th>
            <th colspan="5">11-7</th>
            <th colspan="6">6-0</th>
        </tr>
        <tr>
            <td colspan="6">funct7</td>
            <td colspan="5">rs2</td>
            <td colspan="5">rs1</td>
            <td colspan="5">funct3</td>
            <td colspan="5">rd</td>
            <td colspan="6">opcode</td>
        </tr>
        <tr>
            <td colspan="6">${convertFunctToName(parts.funct7+", "+parts.funct3)}</td>
            <td colspan="5">${convertRegisterToName(parts.rs2)}</td>
            <td colspan="5">${convertRegisterToName(parts.rs1)}</td>
            <td colspan="5">${convertFunctToName(parts.funct7+", "+parts.funct3)}</td>
            <td colspan="5">${convertRegisterToName(parts.rd)}</td>
            <td colspan="6">R-Type</td>
        </tr>
        <tr>
            <td colspan="6">${parts.funct7}</td>
            <td colspan="5">${parts.rs2}</td>
            <td colspan="5">${parts.rs1}</td>
            <td colspan="5">${parts.funct3}</td>
            <td colspan="5">${parts.rd}</td>
            <td colspan="6">${parts.opcode}</td>
        </tr>
        </table>
    `;
        return tableHtml;
    }
    function produceSInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const parts = {
            immm1: binaryInstruction.slice(0, 7),
            rs2: binaryInstruction.slice(7, 12),
            rs1: binaryInstruction.slice(12, 17),
            funct3: binaryInstruction.slice(17, 20),
            immm2: binaryInstruction.slice(20, 25),
            opcode: binaryInstruction.slice(25, 32),
        };

        // Create the table structure
        let tableHtml = `
        <table class="mips-table">
        <tr>
            <th colspan="6">31-25</th>
            <th colspan="5">24-20</th>
            <th colspan="5">19-15</th>
            <th colspan="5">14-12</th>
            <th colspan="5">11-7</th>
            <th colspan="6">6-0</th>
        </tr>
        <tr>
            <td colspan="6">imm[11:5]</td>
            <td colspan="5">rs2</td>
            <td colspan="5">rs1</td>
            <td colspan="5">funct3</td>
            <td colspan="5">imm[4:0]</td>
            <td colspan="6">opcode</td>
        </tr>
        <tr>
            <td colspan="6">${parts.immm1}</td>
            <td colspan="5">${convertRegisterToName(parts.rs2)}</td>
            <td colspan="5">${convertRegisterToName(parts.rs1)}</td>
            <td colspan="5">${parts.funct3}</td>
            <td colspan="5">${parts.immm2}</td>
            <td colspan="6">${parts.opcode}</td>
        </tr>
        </table>
    `;
        return tableHtml;
    }
    function produceSBInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const parts = {
            immm1:  binaryInstruction.slice(0,7),
            rs2: binaryInstruction.slice(7, 12),
            rs1: binaryInstruction.slice(12, 17),
            funct3: binaryInstruction.slice(17, 20),
            immm2: binaryInstruction.slice(20,25),
            opcode: binaryInstruction.slice(25, 32),
        };

        // Create the table structure
        let tableHtml = `
        <table class="mips-table">
        <tr>
            <th colspan="6">31-25</th>
            <th colspan="5">24-20</th>
            <th colspan="5">19-15</th>
            <th colspan="5">14-12</th>
            <th colspan="5">11-7</th>
            <th colspan="6">6-0</th>
        </tr>
        <tr>
            <td colspan="6">imm[12|10:5]</td>
            <td colspan="5">rs2</td>
            <td colspan="5">rs1</td>
            <td colspan="5">funct3</td>
            <td colspan="5">imm[4:1|11]</td>
            <td colspan="6">opcode</td>
        </tr>
        <tr>
            <td colspan="6">${parts.immm1}</td>
            <td colspan="5">${convertRegisterToName(parts.rs2)}</td>
            <td colspan="5">${convertRegisterToName(parts.rs1)}</td>
            <td colspan="5">${parts.funct3}</td>
            <td colspan="5">${parts.immm2}</td>
            <td colspan="6">${parts.opcode}</td>
        </tr>
        </table>
    `;
        return tableHtml;
    }
    function produceIInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const parts = {
            immed: binaryInstruction.slice(0, 12),
            rs1: binaryInstruction.slice(12, 17),
            funct3: binaryInstruction.slice(17, 20),
            rd: binaryInstruction.slice(20, 25),
            opcode: binaryInstruction.slice(25, 32),
        };

        // Create the table structure
        let tableHtml = `
        <table class="mips-table">
        <tr>
            <th colspan="10">31-20</th>
            <th colspan="5">19-15</th>
            <th colspan="5">14-12</th>
            <th colspan="5">11-7</th>
            <th colspan="5">6-0</th>
        </tr>
        <tr>
            <td colspan="10">imm[11:0]</th>
            <td colspan="5">rs1</th>
            <td colspan="5">funct3</th>
            <td colspan="5">rd</th>
            <td colspan="5">opcode</th>
        </tr>
        <tr>
            <td colspan="10">${parts.immed}</td>
            <td colspan="5">${convertRegisterToName(parts.rs1)}</td>
            <td colspan="5">${parts.funct3}</td>
            <td colspan="5">${convertRegisterToName(parts.rd)}</td>
            <td colspan="5">${parts.opcode}</td>
        </tr>
        </table>
    `;
        return tableHtml;

    }

    function produceUJInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const parts = {
            immed: binaryInstruction.slice(0,20),
            rd: binaryInstruction.slice(20, 25),
            opcode: binaryInstruction.slice(25, 32),
        };
        let tableHtml = `
        <table class="mips-table">
        <tr>
            <th colspan="20">31-12</th>
            <th colspan="5">11-7</th>
            <th colspan="5">6-0</th>
        </tr>
        <tr>
            <td colspan="20">imm[20|10:1|11|19:12]</th>
            <td colspan="5">rd</th>
            <td colspan="5">opcode</th>
        </tr>
        <tr>
            <td colspan="20">${parts.immed}</td>
            <td colspan="5">${parts.rd}</td>
            <td colspan="5">${parts.opcode}</td>
        </tr>
        </table>
    `;
    return tableHtml;
    }

    function generateInstructionTable(instruction) {
        const hexInstruction = translateInstructionToHex(instruction);
        const binaryInstruction = hexToBinary(hexInstruction);
        const opCode = binaryInstruction.slice(25, 32);
        switch (opCode) {
            case '0110011':
                explanationDiv.innerHTML = produceRInstructionTable(instruction);
                break;
            case '0100011': //sw
                explanationDiv.innerHTML = produceSInstructionTable(instruction);
                break;
            case '0000011': //lw
            case '0110011': //addi
                explanationDiv.innerHTML = produceIInstructionTable(instruction);
                break;
            case '1100011': //beq/bne
                explanationDiv.innerHTML = produceSBInstructionTable(instruction);
                break;
            case '1101111': //j
                explanationDiv.innerHTML = produceUJInstructionTable(instruction);
                break;
            default:
                explanationDiv.textContent = 'Unknown instruction';
        }
        explanationDiv.style.display = 'block'; // Show the explanation
    }


    function decodeInstruction(instruction) {
        let explanation = '';
        let details = {};

        // Assume `instruction` is a string like "add $t1, $t2, $t3"
        const parts = instruction.split(/\s+/);
        const operation = parts[0]; // e.g., "add"
        console.log('operation', operation);
        switch (operation) {
            case 'add':
            case 'sub':
            case 'and':
            case 'or':
            case 'slt':
                // R-type instructions
                details = {
                    operation: operation,
                    rs: parts[2], // e.g., "$t2"
                    rt: parts[3], // e.g., "$t3"
                    rd: parts[1], // e.g., "$t1"
                    shamt: '0',
                    funct: operationToFunctionCode(operation),
                };
                explanation = `This is an R-type instruction where ${details.rd} gets the result of ${details.operation} operation between ${details.rs} and ${details.rt}.`;
                break;
            // Add cases for I-type and J-type instructions
            case 'lw':
                details = {
                    operation: operation,
                    rt: parts[1], // e.g., "$t1"
                    offset: parts[2], // e.g., "100($t2)"
                    rs: parts[2].split('(')[1].replace(')', ''), // e.g., "$t2"
                };
                explanation = `This is an I-type instruction where ${details.rt} gets the value from memory at the address ${details.offset} offset from ${details.rs}.`;
                break;
            case 'sw':
                details = {
                    operation: operation,
                    rt: parts[1], // e.g., "$t1"
                    offset: parts[2], // e.g., "100($t2)"
                    rs: parts[2].split('(')[1].replace(')', ''), // e.g., "$t2"
                };
                explanation = `This is an I-type instruction where the value in ${details.rt} is stored in memory at the address ${details.offset} offset from ${details.rs}.`;
                break;
            case 'addi':
                details = {
                    operation: operation,
                    rt: parts[1], // e.g., "$t1"
                    rs: parts[2], // e.g., "$t2"
                    immediate: parts[3], // e.g., "100"
                };
                explanation = `This is an I-type instruction where ${details.rt} gets the result of adding the value in ${details.rs} and the immediate value ${details.immediate}.`;
                break;
            case 'beq':
                details = {
                    operation: operation,
                    rs: parts[1], // e.g., "$t1"
                    rt: parts[2], // e.g., "$t2"
                    offset: parts[3], // e.g., "100"
                };
                explanation = `This is an I-type instruction where the program jumps to the target address if the values in ${details.rs} and ${details.rt} are equal.`;
                break;
            case 'bne':
                details = {
                    operation: operation,
                    rs: parts[1], // e.g., "$t1"
                    rt: parts[2], // e.g., "$t2"
                    offset: parts[3], // e.g., "100"
                };
                explanation = `This is an I-type instruction where the program jumps to the target address if the values in ${details.rs} and ${details.rt} are not equal.`;
                break;
        }
        return explanation;
    }


});

module.exports = {
    sum,
    translateInstructionToRISCV,
    translateInstructionToHex
};