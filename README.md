RISCV Translator   
This tool is used on the Computer Architecture course at Universidad del Norte. It is used to translate MIPS instructions to Hexadecimal and viceversa. It also has a RISCV simulator that is still under development.

Funcionality:
1. From RISCV to Hexa
2. From Hexa to RISCV
3. Export and import Logisim RAM
4. RISCV Simulator (ongoing, add, addi, or, and , load, store are working)

List of supported instructions:
1. R (add, sub, and, or)
2. Load
3. Store
4. Branch (beq, bne)
5. Jump and link (jal)

To dockerize the app:   
sudo docker build -t riscvtranslatori .   
sudo docker run -d -it -p 5001:80 --restart unless-stopped --name riscvtranslator-app riscvtranslatori

To test (inside the app folder):
npm install --save-dev jest
npm install --save-dev jest-environment-jsdom
npm test

Augusto Salazar   
Universidad del Norte 2024   
GNU General Public License v3.0