// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

abstract contract SpeedRankingCore {
    struct ScoreEntry {
        address user;
        uint256 speed;
    }

    ScoreEntry[] internal top10;
    mapping(address => uint256[]) internal userSpeeds;

    event SpeedLogged(address indexed user, uint256 speed);

    function logUserSpeed(address user, uint256 speed) internal {
        userSpeeds[user].push(speed);
        emit SpeedLogged(user, speed);
    }

    function updateTop10(address user, uint256 speed) internal {
        top10.push(ScoreEntry(user, speed));

        for (uint256 i = top10.length - 1; i > 0; i--) {
            if (top10[i].speed < top10[i - 1].speed) {
                ScoreEntry memory temp = top10[i - 1];
                top10[i - 1] = top10[i];
                top10[i] = temp;
            } else {
                break;
            }
        }

        if (top10.length > 10) {
            top10.pop();
        }
    }

    function getRank(address user, uint256 speed) internal view returns (uint8) {
        for (uint8 i = 0; i < top10.length; i++) {
            if (top10[i].user == user && top10[i].speed == speed) {
                return i + 1;
            }
        }
        return 255;
    }

    function getTop10() external view returns (ScoreEntry[] memory) {
        return top10;
    }
} 