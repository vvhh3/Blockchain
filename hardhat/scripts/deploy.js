const { ethers } = require("hardhat");

async function deploy(contractName, params) {
  const Contract = await ethers.getContractFactory(contractName); //name contract
  const contract = await Contract.deploy(...params);
  
  // пуш адресса контракта в файл json 
  const fs = require("fs");
  const path = require("path");
  
  const filePath = path.join(__dirname, `../artifacts/contracts/${contractName}.sol/${contractName}.json`);
  
  let data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : {};
  data.address = contract.target;  
  fs.writeFileSync(filePath, JSON.stringify(data));
  return data.address
}

async function main() {
    const addressProfi = await deploy("PROFI", [])
    const addressRTK = await deploy("RTK", [])
    await deploy("DAO", [addressProfi,addressRTK])
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});