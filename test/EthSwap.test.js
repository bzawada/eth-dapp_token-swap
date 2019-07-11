const Token = artifacts.require("Token")
const EthSwap = artifacts.require("EthSwap")

require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('EthSwap', (accounts) => {
    describe('EthSwap deployement', async () => {
        it('contract has a name', async () => {
            let ethSwap = await EthSwap.new()
            const name = await ethSwap.name()
            assertEqual(name, 'EthSwap Instant Exchange')
        })
    })
})
