// UI interactions and updates
const ui = {
    // DOM elements
    elements: {
        connectWalletBtn: document.getElementById('connectWalletBtn'),
        mintBtn: document.getElementById('mintBtn'),
        walletStatus: document.getElementById('walletStatus'),
        statusMessage: document.getElementById('statusMessage'),
        characterInfo: document.getElementById('characterInfo'),
        ticketPreview: document.getElementById('ticketPreview'),
        priceTag: document.getElementById('priceTag'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingMessage: document.getElementById('loadingMessage'),
        transactionDetails: document.getElementById('transactionDetails')
    },
    
    // Initialize UI
    init: function() {
        // Set up event listeners
        this.elements.connectWalletBtn.addEventListener('click', async () => {
            await web3.connectWallet();
        });
        
        this.elements.mintBtn.addEventListener('click', async () => {
            if (messaging.params.characterId) {
                await web3.mintNFT(messaging.params.characterId);
            } else {
                this.updateStatus('Character information not available', 'error');
            }
        });
        
        // Hide loading overlay initially
        this.setLoading(false);
    },
    
    // Setup character info in UI
    setupCharacterInfo: function(params) {
        if (!params.characterName || !params.characterImage) {
            this.updateStatus('Character information not available', 'error');
            return;
        }
        
        // Create character info HTML
        this.elements.characterInfo.innerHTML = `
            <h2>Mint "${params.characterName}" NFT Ticket</h2>
            <div class="character-image">
                <img src="${params.characterImage}" alt="${params.characterName}">
            </div>
        `;
        
        // Create ticket preview
        this.elements.ticketPreview.innerHTML = `
            <div class="ticket-title">ALPHA SOCIAL</div>
            <img class="ticket-character-img" src="${params.characterImage}" alt="${params.characterName}">
            <div class="ticket-mystery">WHO KILLED CASSIE?</div>
            <div class="ticket-name">${params.characterName}</div>
            <div class="ticket-number">TICKET #${params.ticketPrefix}-00001</div>
            <div class="ticket-verify">VERIFY</div>
            <div class="ticket-hologram"></div>
        `;
        
        // Update price
        this.updatePriceTag(params.price);
    },
    
    // Enable mint button
    enableMintButton: function() {
        this.elements.mintBtn.disabled = false;
        this.elements.mintBtn.classList.add('active');
    },
    
    // Disable mint button
    disableMintButton: function() {
        this.elements.mintBtn.disabled = true;
        this.elements.mintBtn.classList.remove('active');
    },
    
    // Update wallet status
    updateWalletStatus: function(message) {
        this.elements.walletStatus.textContent = message;
        if (message.startsWith('Connected')) {
            this.elements.walletStatus.classList.add('connected');
            this.elements.connectWalletBtn.textContent = 'Wallet Connected';
            this.elements.connectWalletBtn.disabled = true;
        } else {
            this.elements.walletStatus.classList.remove('connected');
            this.elements.connectWalletBtn.textContent = 'Connect Wallet';
            this.elements.connectWalletBtn.disabled = false;
        }
    },
    
    // Update status message
    updateStatus: function(message, type = 'info') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.className = 'status ' + type;
        this.elements.statusMessage.style.display = 'block';
    },
    
    // Update price tag
    updatePriceTag: function(price) {
        this.elements.priceTag.textContent = `Price: ${price ? price : '0.01'} ETH`;
    },
    
    // Show transaction link
    showTransactionLink: function(txHash) {
        this.elements.transactionDetails.innerHTML = `
            <p>Transaction submitted:</p>
            <a href="https://sepolia.basescan.org/tx/${txHash}" target="_blank" class="tx-link">
                View on Block Explorer
            </a>
        `;
        this.elements.transactionDetails.style.display = 'block';
    },
    
    // Show NFT details
    showNFTDetails: function(tokenId) {
        this.elements.transactionDetails.innerHTML += `
            <p>NFT minted successfully!</p>
            <p>Token ID: ${tokenId}</p>
            <a href="https://sepolia.basescan.org/token/${web3.contractAddress}?a=${tokenId}" target="_blank" class="tx-link">
                View NFT on Block Explorer
            </a>
        `;
    },
    
    // Set loading state
    setLoading: function(isLoading, message = 'Loading...') {
        if (isLoading) {
            this.elements.loadingMessage.textContent = message;
            this.elements.loadingOverlay.style.display = 'flex';
        } else {
            this.elements.loadingOverlay.style.display = 'none';
        }
    }
}; 