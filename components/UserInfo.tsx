'use client'

import React, { useState, useEffect } from 'react';

import { getNameAndAvatar } from "@/actions/luksoFn"
import { getData, setData } from '@/actions/storageFn';

export function UserInfo(params: any) {
    const [info, setInfo] = useState<any>(undefined)

    console.log("UserInfo.address", params.address);

    const init = async () => {
        //  myAvatar, myName, myAddress

        const infoFromStorage = getData(params.address);
        console.log(infoFromStorage);
        if (infoFromStorage) {
            const myInfo = JSON.parse(infoFromStorage);
            console.log(myInfo);
            setInfo(myInfo);
        } else {
            const myInfo = await getNameAndAvatar(params.address);
            setInfo(myInfo);
            setData(params.address, JSON.stringify(myInfo));
        }
    }

    useEffect(() => {
        init();
    },[])

    return (<>
        {info
            ? <div style={{ "display": "flex" }}>
                <img
                    src={info.myAvatar}
                    width={20}
                    height={20}
                ></img>
                <div style={{ "paddingLeft": "5px" }}>{info.myName}</div>
            </div>
            : <>
                {params.address.substr(0, 5)}
            </>}
    </>
    )
}
