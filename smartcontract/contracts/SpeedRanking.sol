// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

import "./SpeedRankingCore.sol";
import "hardhat/console.sol";

abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(_msgSender());
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

interface INFT {
    function mint(address to, uint256 amount, bool force, bytes memory data) external;
    function transferOwnership(address newOwner) external;
    function owner() external view returns (address);
    function setData(bytes32 dataKey, bytes memory dataValue) external;
}

contract RankingList is Ownable, SpeedRankingCore {
    uint256 public fee = 10000000000000000;

    // 3 NFT contracts for medals
    INFT public nftGold;
    INFT public nftSilver;
    INFT public nftBronze;

    event FeeUpdated(uint256 newFee);

    constructor(address _gold, address _silver, address _bronze, uint256 _fee) {
        nftGold = INFT(_gold);
        nftSilver = INFT(_silver);
        nftBronze = INFT(_bronze);
        fee = _fee;
    }

    function setMedalAddress(address _gold, address _silver, address _bronze) external onlyOwner {
        nftGold = INFT(_gold);
        nftSilver = INFT(_silver);
        nftBronze = INFT(_bronze);
    }

    function setFee(uint256 newFee) external onlyOwner {
        fee = newFee;
        emit FeeUpdated(newFee);
    }

    function mintWithSpeed(uint256 speed) external payable {
        require(msg.value == fee, "Incorrect fee");
        require(speed > 0, "Speed must be positive");

        console.log("msg.sender:",msg.sender);
        logUserSpeed(msg.sender, speed);
        updateTop10(msg.sender, speed);

        uint8 rank = getRank(msg.sender, speed);
        if (rank == 1) {
            nftGold.mint(msg.sender, 1, true, "");
        } else if (rank == 2) {
            nftSilver.mint(msg.sender, 1, true, "");
        } else {
            nftBronze.mint(msg.sender, 1, true, "bronze");
        }

        (bool sent, ) = owner().call{value: msg.value}("");
        require(sent, "Fee transfer failed");
    }


    function getTopUsers() external view returns (ScoreEntry[] memory) {
        return top10;
    }

        /**
     * @dev Transfer ownership of the NFT contract to a new owner
     * @param newOwner Address of the new owner
     * Can only be called by the current owner
     */
    function transferOwnershipOfNFT(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        nftGold.transferOwnership(newOwner);
        nftSilver.transferOwnership(newOwner);
        nftBronze.transferOwnership(newOwner);
    }

    function transferOwnershipOfNFTAddress(address newOwner, address nftAddress) external onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        INFT(nftAddress).transferOwnership(newOwner);
    }

    function setNFTData(address nftAddress, bytes32 dataKey, bytes memory dataValue) external onlyOwner {
        INFT(nftAddress).setData(dataKey, dataValue);
    }

    /**
     * @dev Check if the NFT contract is owned by this contract
     * @return true if NFT contract is owned by this contract, false otherwise
     */
    function isNFTOwnedByContract() external view returns (bool) {
        return (nftGold.owner() == address(this)  && nftSilver.owner() == address(this) && nftBronze.owner() == address(this));
    }

    receive() external payable {}
}