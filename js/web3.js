// Web3 interaction for connecting to wallet and minting NFTs
const web3 = {
    // State
    provider: null,
    signer: null,
    contract: null,
    userAddress: null,
    priceValue: 0.01,
    
    // Contract details
    contractAddress: '0xFcbEFFC1a3896F2880bfbB266C8b0DD5991FF34e',
    contractABI: [
        "function mint(address to, uint256 characterId) external returns (uint256)",
        "function balanceOf(address owner) external view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
        "function ownerOf(uint256 tokenId) external view returns (address)",
        "function getTokenDetails(uint256 tokenId) external view returns (uint256 characterId, uint256 ticketNumber)"
    ],
    
    // Initialize web3
    init: async function() {
        // Check if MetaMask is installed
        if (typeof window.ethereum === 'undefined') {
            ui.updateStatus('Please install MetaMask to mint NFTs', 'error');
            return false;
        }
        
        // Setup event listeners for wallet
        window.ethereum.on('accountsChanged', this.handleAccountsChanged.bind(this));
        window.ethereum.on('chainChanged', this.handleChainChanged.bind(this));
        
        return true;
    },
    
    // Set price value
    setPriceValue: function(price) {
        this.priceValue = price;
        ui.updatePriceTag(price);
    },
    
    // Connect wallet
    connectWallet: async function() {
        try {
            ui.setLoading(true, 'Connecting wallet...');
            
            // Request accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            if (accounts.length === 0) {
                throw new Error('No accounts found. Please connect to MetaMask.');
            }
            
            this.userAddress = accounts[0];
            ui.updateWalletStatus('Connected: ' + this.shortenAddress(this.userAddress));
            
            // Setup provider
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            // Check network and switch if needed
            await this.checkNetwork();
            
            // Setup contract
            this.contract = new ethers.Contract(
                this.contractAddress,
                this.contractABI,
                this.signer
            );
            
            ui.enableMintButton();
            return true;
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            ui.updateStatus('Failed to connect wallet: ' + error.message, 'error');
            return false;
        } finally {
            ui.setLoading(false);
        }
    },
    
    // Check if on correct network
    checkNetwork: async function() {
        // BASE Sepolia testnet chainId is 0x14a34
        const requiredChainId = '0x14a34';
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            
            if (chainId !== requiredChainId) {
                ui.updateStatus('Switching to BASE Sepolia network...', 'info');
                
                try {
                    // Try to switch to BASE Sepolia
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: requiredChainId }],
                    });
                } catch (switchError) {
                    // If network doesn't exist in wallet, add it
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: requiredChainId,
                                chainName: 'BASE Sepolia',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: ['https://sepolia.base.org'],
                                blockExplorerUrls: ['https://sepolia.basescan.org']
                            }],
                        });
                    } else {
                        throw switchError;
                    }
                }
            }
            
            return true;
        } catch (error) {
            console.error('Network switch error:', error);
            ui.updateStatus('Failed to switch network: ' + error.message, 'error');
            throw error;
        }
    },
    
    // Mint NFT
    mintNFT: async function(characterId) {
        if (!this.contract || !this.userAddress) {
            ui.updateStatus('Please connect your wallet first', 'error');
            return;
        }
        
        try {
            ui.setLoading(true, 'Minting your NFT...');
            ui.updateStatus('Preparing transaction...', 'info');
            messaging.updateStatus('minting');
            
            // Call mint function on the contract
            const tx = await this.contract.mint(this.userAddress, characterId);
            
            ui.updateStatus('Transaction sent, waiting for confirmation...', 'info');
            messaging.updateStatus('confirming', { hash: tx.hash });
            ui.showTransactionLink(tx.hash);
            
            // Wait for transaction confirmation
            const receipt = await tx.wait(1);
            
            if (receipt.status === 1) {
                // Find Transfer event to get tokenId
                const transferEvent = receipt.events.find(e => e.event === 'Transfer');
                const tokenId = transferEvent.args.tokenId.toString();
                
                ui.updateStatus('NFT successfully minted!', 'success');
                ui.showNFTDetails(tokenId);
                
                // Notify parent window
                messaging.mintSuccess(tokenId, tx.hash);
                
                return tokenId;
            } else {
                throw new Error('Transaction failed');
            }
            
        } catch (error) {
            console.error('Minting error:', error);
            const errorMsg = error.message || 'Unknown error occurred';
            ui.updateStatus('Minting failed: ' + errorMsg, 'error');
            messaging.mintError(errorMsg);
        } finally {
            ui.setLoading(false);
        }
    },
    
    // Handle accounts changed
    handleAccountsChanged: function(accounts) {
        if (accounts.length === 0) {
            this.userAddress = null;
            this.provider = null;
            this.signer = null;
            this.contract = null;
            ui.updateWalletStatus('Wallet disconnected');
            ui.disableMintButton();
        } else if (accounts[0] !== this.userAddress) {
            this.userAddress = accounts[0];
            ui.updateWalletStatus('Connected: ' + this.shortenAddress(this.userAddress));
            
            // Re-initialize signer with new account
            if (this.provider) {
                this.signer = this.provider.getSigner();
                this.contract = new ethers.Contract(
                    this.contractAddress,
                    this.contractABI,
                    this.signer
                );
            }
        }
    },
    
    // Handle chain changed
    handleChainChanged: function() {
        // Reload the page on chain change as recommended by MetaMask
        window.location.reload();
    },
    
    // Utility: Shorten address for display
    shortenAddress: function(address) {
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }
}; 