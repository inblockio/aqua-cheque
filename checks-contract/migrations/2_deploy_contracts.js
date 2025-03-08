// const MyContract = artifacts.require("MyContract");

// module.exports = function (deployer) {
//   deployer.deploy(MyContract);
// };


const Cheques = artifacts.require("Cheques");

module.exports = async function (deployer, network, accounts) {
    const owner = accounts[0]; // Set the owner to the first account

    await deployer.deploy(Cheques, owner);
    console.log(`Cheques contract deployed at: ${Cheques.address}`);
};
