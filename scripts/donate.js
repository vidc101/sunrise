const APP_ID = "gR4H6h5QjvuqjkEAmszOK7vlDoeT1tIm5RAUBS45";
const SERVER_URL = "https://h7xbqjsok1vv.usemoralis.com:2053/server";
Moralis.start({appId: APP_ID, serverUrl: SERVER_URL});

//const ethers = Moralis.web3Library;
const CHAIN = "0x13881";
Moralis.enableWeb3();
//const provider = ethers.getDefaultProvider(CHAIN);

let content;
let mmButton;
let currentUser;
let chainChange;
let web3Dead;
let userAddress;
let alertBox;
let amountInput;
let donateButton;
let currentContractBalanceDisplay;
let currentContractBalance;
let balanceRefreshClick;

window.onload = () => {
    content = document.getElementById("content");
    mmButton = document.getElementById("mmButton");
    userAddress = document.getElementById("userAddress");
    alertBox = document.getElementById("alertBox");
    amountInput = document.getElementById("amountInput");
    donateButton = document.getElementById("donateButton");
    currentContractBalanceDisplay = document.getElementById("currentContractBalanceDisplay");
    balanceRefreshClick = document.getElementById("balanceRefreshClick");

    balanceRefreshClick.addEventListener("click", displayContractBalance);
    donateButton.addEventListener("click", donate);
    mmButton.addEventListener("click", logIn);
    init();
}

window.ethereum.on('accountsChanged', (accounts) => {
    displayAddress();
    buttonUsability();
})

displayAddress = async () => {
    $('#mmButton').hide();
    currentUser = ethereum.selectedAddress;
    let displayedAddressArray = currentUser.split('');
    let displayedAddress = displayedAddressArray.slice(0, 5).join('') + '...' + displayedAddressArray.slice(-4, -1).join('')
                            + displayedAddressArray[displayedAddressArray.length-1];
    userAddress.innerHTML = displayedAddress;
    console.log(currentUser);
}

init = async () => {
    currentUser = ethereum.selectedAddress;
    if (currentUser != undefined) {
        displayAddress();
    }
    buttonUsability();
    displayContractBalance();
}

logIn = async () => {
    await Moralis.authenticate()
    .then(function (user) {
        currentUser = user.get("ethAddress");
        buttonUsability();
        //console.log(currentUser);
    })
    .catch((error) => {
        console.log(error);
        popAlert("Log In Failed");
        logIn();
    })
    let chainId = await Moralis.chainId;
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
                alert("Something went wrong. Please clear your cookies and try again");
            })
        }
    }
    chainChange = Moralis.onChainChanged((chain) => {
        console.log(chain);
        if (chain === CHAIN) {
            clearAlert();
        } else {
            popAlert("Please switch back to Mumbai Network");
            forceChain();
        }
    });
    web3Dead = Moralis.onWeb3Deactivated((result) => {
        console.log(result);
        popAlert("Please re-enable web3 in your browser");
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

popAlert = (text) => {
    alertBox.style = "opacity: 85%;";
    alertBox.innerText = text;
}

clearAlert = () => {
    alertBox.style = "opacity: 0%;";
    alertBox.innerText = "";
}

donate = async () => {
    console.log("Donate");
    if (amountInput.value == undefined) {
        popAlert("Please input a value");
        setTimeout(() => {return}, 1500);
        clearAlert();
    }
    let value = Moralis.Units.ETH(amountInput.value);
    let options = {
        functionName: "donate",
        contractAddress: MAIN_CONTRACT_ADDRESS,
        abi: MAIN_CONTRACT_ABI,
        msgValue: value,
        chain: CHAIN,
        params: {},
    }
    await Moralis.executeFunction(options)
    .then(receipt => console.log(receipt))
}

buttonUsability = () => {
    if (ethereum.selectedAddress == undefined) {
        donateButton.disabled = true;
    }
}

displayContractBalance = async () => {
    let options = {
        chain: CHAIN,
        address: MAIN_CONTRACT_ADDRESS,
        abi: MAIN_CONTRACT_ABI,
        function_name: "balance",
    }
    currentContractBalanceDisplay.style = "margin-top: 1rem; font-size: 2rem; font-weight: bold;";
    let response = await Moralis.Web3API.native.runContractFunction(options);
    //console.log(response);
    response = Moralis.Units.FromWei(response);
    currentContractBalanceDisplay.innerText = `${parseFloat(response).toFixed(2)} MATIC`;
}