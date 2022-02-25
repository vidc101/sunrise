const APP_ID = "gR4H6h5QjvuqjkEAmszOK7vlDoeT1tIm5RAUBS45";
const SERVER_URL = "https://h7xbqjsok1vv.usemoralis.com:2053/server";
Moralis.start({appId: APP_ID, serverUrl: SERVER_URL});

const CHAIN = "0x13881";

let content;
let mmButton;
let currentUser;
let chainChange;
let web3Dead;
let userAddress;

window.onload = () => {
    content = document.getElementById("content");
    mmButton = document.getElementById("mmButton");
    userAddress = document.getElementById("userAddress");

    mmButton.addEventListener("click", logIn);
    init();
}

window.ethereum.on('accountsChanged', (accounts) => {
    console.log(accounts);
    //currentUser = accounts[0];
    displayAddress();
})

displayAddress = async () => {
    $('#mmButton').hide();
    //currentUser = await Moralis.account;
    currentUser = ethereum.selectedAddress;
    let displayedAddressArray = currentUser.split('');
    let displayedAddress = displayedAddressArray.slice(0, 5).join('') + '...' + displayedAddressArray.slice(-4, -1).join('')
                            + displayedAddressArray[displayedAddressArray.length-1];
    userAddress.innerHTML = displayedAddress;
    //console.log(currentUser);
}

init = async () => {
    /*const web3Status = Moralis.ensureWeb3IsInstalled();
    console.log(web3Status);
    if(!web3Status) {
        content.innerHTML = "<h1>Please install metamask and try again</h1>";
    }*/
}

logIn = async () => {
    await Moralis.authenticate()
    .then(function (user) {
        currentUser = user.get("ethAddress");
        console.log(currentUser);
    })
    .catch((error) => {
        console.log(error);
        alert("Log In Failed");
        logIn();
    })
    let chainId = await Moralis.chainId;
    //console.log(chainId);
    if (chainId != CHAIN) {
        let switched = true;
        await Moralis.switchNetwork(CHAIN)
        .catch((error) => {
            switched = false;
            console.log(error);
            alert("Please add mumbai chain to your metamask");
        });
        if (!switched) {
            let chainName = "Mumbai Testnet";
            let currencyName = "MATIC";
            let currencySymbol = "MATIC";
            let rpcUrl = "https://speedy-nodes-nyc.moralis.io/44806d30000119405ac0427c/polygon/mumbai";
            let blockExplorerUrl = "https://mumbai.polygonscan.com/";
            await Moralis.addNetwork(
                chainId, 
                chainName, 
                currencyName, 
                currencySymbol, 
                rpcUrl,
                blockExplorerUrl
            )
            .catch((error) => {
                console.log(error);
                content.innerHTML = "<h1>Something went wrong, please refresh the page and try again</h1>";
            })
        }
    }
    chainChange = Moralis.onChainChanged((chain) => {
        console.log(chain);
        if (chain != CHAIN) {
            content.innerHTML = "<h1>Please switch back to Mumbai Network</h1>";
            forceChain();
        }
    });
    web3Dead = Moralis.onWeb3Deactivated((result) => {
        console.log(result);
        content.innerHTML = "<h1>Please re-enable web3 in your browser</h1>";
        logIn();
    });
    displayAddress();
}

forceChain = async () => {
    let chain = await Moralis.chainId;
    if (chain != CHAIN) {
        console.log(chain);
        await Moralis.switchNetwork(CHAIN)
        .catch((error) => {
            console.log(error);
            forceChain();
        })
    }
}