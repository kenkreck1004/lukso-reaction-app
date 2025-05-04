// Import and Network Setup
import Web3 from 'web3';
import { ERC725 } from '@erc725/erc725.js';

import lsp3Schema from '@erc725/erc725.js/schemas/LSP3ProfileMetadata.json'

import LSP4DigitalAssetSchema from '@erc725/erc725.js/schemas/LSP4DigitalAsset.json';

const RPC_ENDPOINT = 'https://rpc.testnet.lukso.network';
// const IPFS_GATEWAY = 'https://2eff.lukso.dev/ipfs/';
const IPFS_GATEWAY = 'https://api.universalprofile.cloud/ipfs/';

// Parameters for ERC725 Instance
const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT);
const config = { ipfsGateway: IPFS_GATEWAY };

export const DEFAULT_GAS = 5_000_000;
export const DEFAULT_GAS_PRICE = "10000000000";

import RankingLogContract from './RankingLogContract.json';

declare global {
  interface Window {
    web3?: any; 
    myRanking?: any;
  }
}

export async function fetchProfile(address: any) {
    try {
        const profile = new ERC725(lsp3Schema, address, provider, config);
        return await profile.fetchData();
    } catch (error) {
        console.log(error);
        return {
            error: 'This is not an ERC725 Contract'
        }
    }
}

export async function fetchProfileByQuery(address: any, query: any) {
    try {
        const profile = new ERC725(lsp3Schema, address, provider, config);
        return await profile.fetchData(query);
    } catch (error) {
        return {
            error: 'This is not an ERC725 Contract'
        }
    }
}

export async function getNameAndAvatar(myAddress: any) {
    let myProfile = await getProfileData(myAddress);

    var myAvatar = "";
    if (myProfile && myProfile.profileImage && myProfile.profileImage[0]) {
        myAvatar = (myProfile.profileImage[0].url).replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    var myName = myProfile.name;
    return {
        myAvatar, myName, myAddress
    }
}

export async function getProfileData(address: any) {
    var myProfile: any = await fetchProfileByQuery(address, "LSP3Profile");
    if (!myProfile.value) {
        return "";
    }
    return myProfile.value.LSP3Profile
}

export async function setupWeb3(provider: any) {
    window.web3 = new Web3(provider);

    window.myRanking = new window.web3.eth.Contract(
        RankingLogContract.abi,
        RankingLogContract.address
    );

}


export async function makeRankingLog(fromAccount: any, speed: any, value: any) {
    console.log("makeRankingLog:", speed, value)
    const tx = await window.myRanking.methods.mintWithSpeed(speed).send({
        from: fromAccount,
        value: value,
        gasPrice: DEFAULT_GAS_PRICE,
    });
    return tx;
}

export async function getRankingFee() {
    return await window.myRanking.methods.fee().call();
}


export async function getTop10() {
  return await window.myRanking.methods.getTop10().call();
}