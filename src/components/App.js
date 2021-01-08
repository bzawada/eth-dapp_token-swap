import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import EthSwap from '../abis/EthSwap.json';
import Token from '../abis/Token.json';
import Main from './Main';

class App extends Component {
    async componentDidMount() {
        await this.loadWeb3()
        await this.loadBlockchainData()
    }

    refreshPage() {
        window.location.reload();
    }

    async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        this.setState({ account: accounts[0]})
        const ethBalance = await web3.eth.getBalance(this.state.account)
        this.setState({ ethBalance })

        const networkId = await web3.eth.net.getId()
        const tokenData = Token.networks[networkId]
        if(tokenData) {
            const token = new web3.eth.Contract(Token.abi, tokenData.address)
            this.setState({ token })
            let tokenBalance = await token.methods.balanceOf(this.state.account).call()
            this.setState({ tokenBalance: tokenBalance.toString() })
        } else {
            window.alert('Token contract not deployed to detected network.')
        }

        const ethSwapData = EthSwap.networks[networkId]
        if(ethSwapData) {
            const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
            this.setState({ ethSwap })
        } else {
            window.alert('Eth swap contract not deployed to detected network.')
        }

        this.setState({ loading: false })
    }

    async loadWeb3() {
        // Modern dapp browsers...
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
            // Acccounts always exposed
            window.web3.eth.sendTransaction({/* ... */});
        }
        // Non-dapp browsers...
        else {
            console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    }

    buyTokens = (etherAmount) => {
        this.setState({ loading: true })
        this.state.ethSwap.methods
            .buyTokens()
            .send({ from: this.state.account, value: etherAmount })
            .on('transactionHash', (hash) => {
                 this.setState({ loading: false })
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                this.refreshPage()
            })
    }

    sellTokens = (tokenAmount) => {
        this.setState({ loading: true })
        this.state.token.methods
            .approve(this.state.ethSwap.address, tokenAmount)
            .send({ from: this.state.account })
            .on('transactionHash', (hash) => {
                this.state.ethSwap.methods
                    .sellTokens(tokenAmount)
                    .send({ from: this.state.account })
                    .on('transactionHash', (hash) => {
                        this.setState({ loading: false })
                    })
                    .on('confirmation', (confirmationNumber, receipt) => {
                        this.refreshPage()
                    })
            })
    }

    constructor(props) {
        super(props);
        this.state = {
            token: {},
            ethSwap: {},
            account: '',
            ethBalance: '0',
            tokenBalance: '0',
            loading: true
        };
    }

    render() {
        let content
        if (this.state.loading) {
            content = <p id="loader" className="text-center">Loading...</p>
        } else {
            content = <Main
                tokenBalance={this.state.tokenBalance}
                ethBalance={this.state.ethBalance}
                buyTokens={this.buyTokens}
                sellTokens={this.sellTokens}
            />
        }
        return (
            <div>
                <Navbar account={this.state.account} />
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
                            <div className="content mr-auto ml-auto">
                                {content}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
