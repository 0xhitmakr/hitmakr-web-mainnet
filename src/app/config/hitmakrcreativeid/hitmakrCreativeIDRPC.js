"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import abi from "./abi/abi";
import { useQuery } from "@tanstack/react-query";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_HITMAKR_CREATIVE_ID_ADDRESS;
const RPC_URL = process.env.NEXT_PUBLIC_SKALE_MAINNET_RPC_URL;

export const useCreativeIDRPC = (address) => {
  const fetchCreativeID = async () => {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

    const paused = await contract.paused();
    const data = await contract.getCreativeID(address);
    
    return {
      id: data[0],
      timestamp: Number(data[1]),
      exists: data[2],
      paused,
    };
  };

  const { data, isPending, error } = useQuery({
    queryKey: ["creativeId", address],
    queryFn: fetchCreativeID,
    enabled: !!address,
  });

  return {
    creativeIDInfo: data,
    loading: isPending,
    error,
    isPaused: data?.paused,
  };
};

export const useHasCreativeIDRPC = (address) => {
  const [hasCreativeID, setHasCreativeID] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkCreativeID = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const paused = await contract.paused();
        setIsPaused(paused);

        // Check if the address has a Creative ID by checking if one exists in the registry
        const data = await contract.getCreativeID(address);
        setHasCreativeID(data[2]); // data[2] is the 'exists' boolean
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      checkCreativeID();
    }
  }, [address]);

  return { hasCreativeID, loading, error, isPaused };
};

export const useIsCreativeIDTakenRPC = (creativeID) => {
  const [isTaken, setIsTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const checkCreativeID = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const paused = await contract.paused();
        setIsPaused(paused);

        const data = await contract.takenCreativeIDs(creativeID);
        setIsTaken(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (creativeID) {
      checkCreativeID();
    }
  }, [creativeID]);

  return { isTaken, loading, error, isPaused };
};

export const useTotalCreativeIDsRPC = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

        const paused = await contract.paused();
        setIsPaused(paused);

        const data = await contract.totalCreativeIDs();
        setCount(Number(data));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, []);

  return { count, loading, error, isPaused };
};