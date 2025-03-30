// Messaging system for communicating with parent Wix site
const messaging = {
    // Store received parameters
    params: {
        characterId: null,
        characterName: null,
        characterImage: null,
        ticketPrefix: null,
        price: null,
        transactionId: null
    },
    
    // Initialize messaging
    init: function() {
        // Listen for messages from parent (Wix)
        window.addEventListener('message', this.handleIncomingMessage.bind(this));
        
        // Inform parent that minter is ready
        this.sendMessage({ type: 'minter-loaded' });
    },
    
    // Handle incoming messages
    handleIncomingMessage: function(event) {
        // Security: validate origin to ensure it's from your Wix site
        const allowedOrigins = ['https://your-wix-site.com', 'https://editor.wix.com'];
        if (!allowedOrigins.includes(event.origin)) {
            console.warn('Message from unauthorized origin:', event.origin);
            return;
        }
        
        console.log('Message received:', event.data);
        
        // Handle initialization data
        if (event.data.type === 'init-minter') {
            this.params = {
                characterId: event.data.characterId,
                characterName: event.data.characterName,
                characterImage: event.data.characterImage,
                ticketPrefix: event.data.ticketPrefix,
                price: event.data.price,
                transactionId: event.data.transactionId
            };
            
            // Initialize UI with received data
            ui.setupCharacterInfo(this.params);
            web3.setPriceValue(this.params.price);
        }
    },
    
    // Send message to parent
    sendMessage: function(message) {
        // Always use parent's origin if available, otherwise use '*' as fallback
        const targetOrigin = '*';
        window.parent.postMessage(message, targetOrigin);
    },
    
    // Send status updates to parent
    updateStatus: function(status, data = {}) {
        this.sendMessage({
            type: 'status-update',
            status: status,
            data: data,
            timestamp: Date.now()
        });
    },
    
    // Send minting success to parent
    mintSuccess: function(tokenId, transactionHash) {
        this.sendMessage({
            type: 'mint-success',
            characterId: this.params.characterId,
            characterName: this.params.characterName,
            tokenId: tokenId,
            transactionHash: transactionHash,
            transactionId: this.params.transactionId
        });
    },
    
    // Send error to parent
    mintError: function(errorMessage) {
        this.sendMessage({
            type: 'mint-error',
            error: errorMessage,
            transactionId: this.params.transactionId
        });
    }
}; 