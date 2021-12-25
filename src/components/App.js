import React, { Component } from 'react';
import Web3 from 'web3'
import './App.css';
import MemoryToken from '../abis/MemoryToken.json'
import brain from '../brain.png'
const Cards = [
  {
    name: 'cheeseburger',
    img: '/images/cheeseburger.png'
  },
  {
    name: 'fries',
    img: '/images/fries.png'
  },
  {
    name: 'hotdog',
    img: '/images/hotdog.png'
  },
  {
    name: 'icecream',
    img: '/images/ice-cream.png'
  },
  {
    name: 'milkshake',
    img: '/images/milkshake.png'
  },
  {
    name: 'pizza',
    img: '/images/pizza.png'
  }
]


class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardList: [],
      cardChosen: null,
      cardsWon: [],
    }
  }

  async componentWillMount(){
    await this.loadWeb3();
    await this.loadBlockchainData();
    // State: 0: blank, 1: flip, 2: white
    const cardList = this.shuffle([...Cards, ...Cards]).map((x, index) => { return {id: index, cardState: 0, ...x}});
    this.setState({cardList});
  }

  async loadWeb3(){
    if(window.ethereum){
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if(window.web3){
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else{
      window.alert('Non ethereum browser detected');
    }
  }

  async loadBlockchainData(){
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    if(accounts.length > 0){
      this.setState({
        account: accounts[0]
      });
    }

    const networkId = await web3.eth.net.getId()
    const networkData = MemoryToken.networks[networkId];
    if(networkData){
      const abi = MemoryToken.abi;
      const address= networkData.address;
      const token = new web3.eth.Contract(abi, address)
      this.setState({token});

      const totalSupply = await token.methods.totalSupply().call();
      this.setState({totalSupply});

      let balanceOf = await token.methods.balanceOf(address).call();
      let tokenIds = [];
      for(let i = 0; i < balanceOf; i++){
        let id = await token.methods.tokenOfOwnerByIndex(address, i).call();
        tokenIds.push(id);
      }
      this.setState({
        tokenURIs: [...this.state.tokenURIs, tokenIds]
      })
    }
  }

  shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  chooseCard(id){
    const cards = this.state.cardList;
    if(cards[id].cardState !== 2){
      cards[id].cardState = cards[id].cardState === 1? 0: 1;
      this.setState({cardList: cards});
      if(cards[id].cardState === 1){
        if(this.state.cardChosen){
          setTimeout(() => {this.checkMatch(id)}, 2000);
        }
        else{
          this.setState({cardChosen: cards[id]});
        }
      }
      else{
        this.setState({cardChosen: null});
      }
      
    }
  }

  checkMatch(id){
    const cards = this.state.cardList;
    if(cards[id].name === this.state.cardChosen.name){
      this.state.token.methods.mint(
        this.state.account,
        window.location.origin + cards[id].img
      ).send(
        {from: this.state.account}
      ).on('transactionHash', (hash) =>{
        cards[id].cardState = 2;
        cards[this.state.cardChosen.id].cardState = 2;
        this.setState({
          cardsWon: [...this.state.cardsWon, this.state.cardChosen, cards[id]], 
          cardChosen: null,
          cardList: cards, 
          tokenURIs: [...this.state.tokenURIs, cards[id].img]
        });
      })
    }
    else{
      cards[id].cardState = 0;
      cards[this.state.cardChosen.id].cardState = 0;
      this.setState({cardList: cards, cardChosen: null});
    }
  }

  getCardImage(card){
    switch(card.cardState){
      case 0: return '/images/blank.png';
      case 1: return card.img;
      case 2: return '/images/white.png';
      default: return '/images/blank.png';
    }
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
          <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
          &nbsp; Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted"><span id="account">{this.state.account}</span></small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">Edit this file in App.js!</h1>

                <div className="grid mb-4" >
                  <div className='row'>
                  {/* Code goes here... */}
                  {
                    this.state.cardList.map(element => {
                      return (<div className='col-4 mt-4' onClick={() => this.chooseCard(element.id)}>
                          <img src={this.getCardImage(element)} alt="card"/>
                        </div>);
                    })
                  }
                  </div>

                </div>

                <div>
                  <h5>Tokens collected: 
                    <span> &nbsp;{this.state.tokenURIs.length}
                    </span>
                  </h5>

                  {/* Code goes here... */}

                  <div className="grid mb-4" >

                    {/* Code goes here... */}
                    {this.state.tokenURIs.map((tokenURI, key) => {
                      return (<img
                        key={key}
                        src={tokenURI}
                        alt={tokenURI}
                      />);
                    })}
                  </div>

                </div>

              </div>

            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
