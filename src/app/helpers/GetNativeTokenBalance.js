"use client"
import { useBalance,useAccount } from "wagmi";
import { skaleCalypso } from 'wagmi/chains'



export default function GetNativeTokenBalance() {
    const { address } = useAccount();
    const { data: balanceData } = useBalance({
        address: address,
        chainId: skaleCalypso.id,
    });

    return { balanceData };
}