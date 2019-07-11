import React, { Component } from 'react';
import logo from '../logo.png';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar';
import EthSwap from '../abis/EthSwap.json'
import Token from '../abis/Token.json'

class App extends Component {
  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0]})
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // const networkId = await web3.eth.net.getId()
    // const tokenData = Token.networks[networkId]
    // if (tokenData) {
    //   const token = new web3.eth.Contract(Token.abi, tokenData.address);
    //   this.setState({ token })
    //   let tokenBalance = await token.methods.balanceOf(this.state.account).call()
    //   console.log(token);
    //   console.log(tokenBalance);
    //   console.log(this.state.account);
    //   // this.setState({ tokenBalance: tokenBalance.toString() })
    // } else {
    //   console.log('Token contract not deployed to detected network.')
    // }
    // Load Token
    const networkId =  await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })
      console.log(token.methods)
      let tokenBalance = token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert('Token contract not deployed to detected network.')
    }
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

  constructor(props) {
    super(props);
    this.state = {
      token: {},
      account: '',
      ethBalance: '0',
      tokenBalance: '0'
    };
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={logo} className="App-logo" alt="logo" />
                </a>
                <h1>Dapp University Starter Kit</h1>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
