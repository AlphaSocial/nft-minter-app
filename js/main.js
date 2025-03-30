// Main application logic
(async function() {
    // Initialize modules
    ui.init();
    const web3Initialized = await web3.init();
    messaging.init();
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('transactionId');
    const characterId = parseInt(urlParams.get('characterId') || '0');
    
    // If URL contains parameters, use them
    if (transactionId && characterId) {
        messaging.params.transactionId = transactionId;
        messaging.params.characterId = characterId;
        
        // Request additional data from parent
        messaging.sendMessage({
            type: 'get-character-data',
            characterId: characterId,
            transactionId: transactionId
        });
    }
    
    // Auto-connect wallet if web3 is initialized
    if (web3Initialized && window.ethereum.isConnected()) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                web3.connectWallet();
            }
        } catch (error) {
            console.error('Auto-connect error:', error);
        }
    }
})(); 