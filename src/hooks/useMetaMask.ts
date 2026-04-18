import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

interface MetaMaskState {
  walletAddress: string | null;
  signer: ethers.JsonRpcSigner | null;
  provider: ethers.BrowserProvider | null;
  isConnecting: boolean;
  error: string | null;
}

export function useMetaMask() {
  const [state, setState] = useState<MetaMaskState>({
    walletAddress: null,
    signer: null,
    provider: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async (forceSelect = false) => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: "MetaMask is not installed. Please install it to continue." }));
      return;
    }

    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      if (forceSelect) {
        // Force MetaMask to show the account selection dialog
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
      }

      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setState({
        walletAddress: address,
        signer,
        provider,
        isConnecting: false,
        error: null,
      });

      return address;
    } catch (err: any) {
      console.error("MetaMask connection error:", err);
      let errorMessage = "An error occurred while connecting to MetaMask.";
      
      if (err.code === 4001) {
        errorMessage = "Connection request rejected by user.";
      } else if (err.code === -32002) {
        errorMessage = "Request already pending. Please check MetaMask.";
      }

      setState(prev => ({ 
        ...prev, 
        isConnecting: false, 
        error: errorMessage 
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      walletAddress: null,
      signer: null,
      provider: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected all accounts
          disconnect();
        } else if (state.walletAddress && accounts[0] !== state.walletAddress) {
          // User switched accounts
          connect();
        }
      };

      const handleChainChanged = () => {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [state.walletAddress, connect, disconnect]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
