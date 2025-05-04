'use client'

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';

// Styled components
const GameArea = styled.div<{ isGreen: boolean }>`
  height: 100vh;
  width : 150vh;
  background-color: ${props => props.isGreen ? 'blue' : 'red'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  user-select: none;
  position: relative;
`;

const RankingButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  background: white;
  border: none;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  z-index: 100;
`;

const Modal = styled.div<{ show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
  z-index: 1000;
  display: ${props => props.show ? 'block' : 'none'};
  width: 300px;
  color: black;
  font-size: 13px;
`;

const Overlay = styled.div<{ show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.3);
  z-index: 999;
  display: ${props => props.show ? 'block' : 'none'};
`;

const StartButton = styled.div`
  border: 1px solid red;
  border-radius: 10px;
  padding: 5px;
  margin: auto;
  background: red;
  color: white;
  cursor: pointer;
  text-align: center;
  margin-top: 1px;
  margin-bottom: 1px;
  width : 60%;
`;

const LogButton = styled.div`
  border: 1px solid blue;
  border-radius: 10px;
  padding: 5px;
  margin: auto;
  background: blue;
  color: white;
  cursor: pointer;
  text-align: center;
  width: 60%;
`;

const LeaderboardTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1px;

  th, td {
    border: 1px solid #ddd;
    text-align: center;
  }
`;

import { useUpProvider } from "./upProvider";

import { getRankingFee, makeRankingLog, setupWeb3, getTop10 } from "@/actions/luksoFn"

import { UserInfo } from './UserInfo';

export function Game() {

    const { accounts, walletConnected, provider } = useUpProvider();

    const [isGreen, setIsGreen] = useState(false);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<any>(
        <>
        </>
    );

    // const [scores, setScores] = useState<Score[]>([]);

    // const [user, setUser] = useState({});

    const startGame = useCallback(() => {
        setShowModal(false);
        setIsGreen(false);
        const waitTime = Math.floor(Math.random() * 3000) + 2000;

        const timeout = setTimeout(() => {
            setIsGreen(true);
            setStartTime(Date.now());

            // Set timeout for too slow
            const greenTimeout = setTimeout(() => {
                if (startTime && !showModal) {
                    setModalContent(
                        <>
                            <h2>Too slow!</h2>
                            <h3>You missed the moment. Want to give it another shot?</h3>
                            <StartButton onClick={startGame}>
                                Try again
                            </StartButton>
                        </>);
                    setShowModal(true);
                }
            }, 10000);

            return () => clearTimeout(greenTimeout);
        }, waitTime);

        return () => clearTimeout(timeout);
    }, [startTime]);

    const init = async () => {
        // let fetchedUser = await getNameAndAvatar(userAccount);
        // console.log(fetchedUser);
        // setUser(fetchedUser);
        setupWeb3(provider);
        startGame();
    }

    useEffect(() => {
        // lkTest();
        // Load scores from localStorage on mount
        if (accounts[0]) {
            //   const savedScores = localStorage.getItem('reactionScores');
            //   if (savedScores) {
            //       setScores(JSON.parse(savedScores));
            //   }
            init();
        }
    }, [accounts[0]]);

    const logSpeed = async (e: any, speed: any, valueLYX: any) => {
        e.preventDefault();
        await makeRankingLog(accounts[0], speed, valueLYX * (10 ** 18));
    }

    const updateLeaderboard = async (time: number) => {
        // const name = "Player"; // You can implement name input later
        // const newScores = [...scores, { name, time }]
        //     .sort((a, b) => a.time - b.time)
        //     .slice(0, 10);

        // setScores(newScores);
        // localStorage.setItem('reactionScores', JSON.stringify(newScores));
        let rankingFee: any = await getRankingFee();
        rankingFee = rankingFee / (10 ** 18);

        setModalContent(
            <>
                <h2 style={{ "fontSize": "20px", "fontWeight": "700", "textAlign": "center" }}>
                    Nice reflexes!
                </h2>
                <div>Your reaction time is {time} ms</div>
                <div>Want to join the game for just {rankingFee} LYX and claim your Reaction Medal?</div>
                <LogButton onClick={(e) => logSpeed(e, time, rankingFee)}>
                    Join Now & Claim Medal
                </LogButton>
                <StartButton onClick={startGame}>
                    Try again
                </StartButton>
            </>
        );
        setShowModal(true);
    };

    const handleClick = () => {
        if (isGreen && startTime) {
            const reactionTime = Date.now() - startTime;
            updateLeaderboard(reactionTime);
            // startGame();
        } else {
            setModalContent(
                <>
                    <h2 style={{ "textAlign": "center", "fontSize": "20px", "fontWeight": "700" }}>
                        Too soon!
                    </h2>
                    <StartButton onClick={startGame}>
                        Try again
                    </StartButton>
                </>);
            setShowModal(true);
        }
    };

    const showLeaderBoard = async (e: any) => {
        
        e.preventDefault();
        const scores = await getTop10();

        // console.log(scores);

        setModalContent(
            <>
                <h2 style={{ "fontSize": "18px", "fontWeight": "700", "textAlign": "center" }}>
                    Leaderboard
                </h2>
                <LeaderboardTable>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Time (ms)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scores.map((score : any, index: any) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td><UserInfo
                                    address={score.user}
                                /></td>
                                <td>{score.speed}</td>
                            </tr>
                        ))}
                    </tbody>
                </LeaderboardTable>
            </>
        );
        setShowModal(true);
    }

    return (
        <>
            <RankingButton onClick={showLeaderBoard}>
                🏆
            </RankingButton>

            <GameArea
                isGreen={isGreen}
                onClick={handleClick}
            >
                {
                    isGreen
                        ? 'CLICK NOW!'
                        : (walletConnected && accounts[0])
                            ? 'Get ready… wait for blue!'
                            : 'Lets connect to start'}
            </GameArea>

            <Overlay show={showModal} onClick={() => setShowModal(false)} />

            <Modal show={showModal}>
                {modalContent}
            </Modal>
        </>
    );
};
