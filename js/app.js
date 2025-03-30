// Debug logging
console.log('Script starting...');

// Function to check if ethers is loaded
function checkEthersLoaded() {
    console.log('Checking ethers...');
    if (typeof ethers === 'undefined') {
        console.error('Ethers.js not loaded');
        return false;
    }
    console.log('Ethers.js loaded successfully');
    return true;
}

// Initialize the page
function startInitialization() {
    console.log('Starting initialization...');
    
    // Wait a short moment to ensure ethers is loaded
    setTimeout(() => {
        if (!checkEthersLoaded()) {
            showStatusMessage('Error: Failed to load required libraries. Please refresh the page.', false);
            return;
        }
        
        try {
            initializePage();
            window.parent.postMessage({ type: 'html-game-loaded' }, '*');
            console.log('Initialization complete');
        } catch (error) {
            console.error('Initialization error:', error);
            showStatusMessage('Error initializing page. Please refresh.', false);
        }
    }, 1000);
}

// Sample character data - replace with your actual data fetching logic
const characters = [
    {
        id: 1,
        name: "Cassie",
        image: "https://static.wixstatic.com/media/db50f1_16167e41809d4fc4a7be208687919798~mv2.png",
        description: "Murder or suicide?",
        votes: 42,
        ticketPrice: 10.00,
        ticketPrefix: "CASSIE"
    },
    {
        id: 2,
        name: "Thady",
        image: "https://static.wixstatic.com/media/db50f1_542f97bac39543578390eab4f69d6181~mv2.png",
        description: "Trigger man?",
        votes: 28,
        ticketPrice: 10.00,
        ticketPrefix: "THADY"
    },
    {
        id: 3,
        name: "Lauren",
        image: "https://static.wixstatic.com/media/db50f1_438bf364fbbd47b3bfa3e59453b101a3~mv2.png",
        description: "Dedicated or delusional?",
        votes: 35,
        ticketPrice: 10.00,
        ticketPrefix: "LAUREN"
    },
    {
        id: 4,
        name: "Oak",
        image: "https://static.wixstatic.com/media/db50f1_a464ff95bfbd46ef8662f2f526a9cc02~mv2.png",
        description: "Lover or murderer?",
        votes: 29,
        ticketPrice: 10.00,
        ticketPrefix: "OAK"
    },
    {
        id: 5,
        name: "Sonny",
        image: "https://static.wixstatic.com/media/db50f1_8583601d5d4a4d0c81c43d5591fc8c50~mv2.png",
        description: "Crime Crusader or Corrupt Cop?",
        votes: 21,
        ticketPrice: 10.00,
        ticketPrefix: "SONNY"
    },
    {
        id: 6,
        name: "Florentina",
        image: "https://static.wixstatic.com/media/db50f1_23d75280909845ee8d77a18d58c7b449~mv2.png",
        description: "Confidant or killer",
        votes: 22,
        ticketPrice: 10.00,
        ticketPrefix: "FLOR"
    }
];

let userVoteCount = 0;
let currentVotedCharacterId = null;
let userTickets = [];
let selectedCharacter = null;
let paymentPopup = null;
let statusPopup = null;
let hasProcessedPayment = false;
let isProcessingPayment = false;

// DOM Elements
const cardsContainer = document.getElementById('cardsContainer');
const loadingScreen = document.getElementById('loadingScreen');
const statusMessage = document.getElementById('statusMessage');
const totalVotesElement = document.getElementById('totalVotes');
const ownedTicketsElement = document.getElementById('ownedTickets');
const ticketModal = document.getElementById('ticketModal');
const closeModal = document.getElementById('closeModal');
const characterPreviewImage = document.getElementById('characterPreviewImage');
const characterPreviewName = document.getElementById('characterPreviewName');
const characterTicketNumber = document.getElementById('characterTicketNumber');
const purchaseButton = document.getElementById('purchaseButton');

// Initialize the page
function initializePage() {
    loadUserVote();
    loadUserTickets();
    loadUserNFTs();
    setupWalletListeners();
    renderCharacters();
    updateStats();
    hideLoadingScreen();
    
    // Check if user is logged in
    checkUserLogin();
}

// Load user's current vote if any
function loadUserVote() {
    // Message parent Wix page to get user's current vote
    window.parent.postMessage({ type: 'get-user-vote' }, '*');
}

// Load user's tickets if any
function loadUserTickets() {
    // Message parent Wix page to get user's tickets
    window.parent.postMessage({ type: 'get-user-tickets' }, '*');
}

// Check if user is logged in 
function checkUserLogin() {
    // Message parent Wix page to check user login status
    window.parent.postMessage({ type: 'check-user-login' }, '*');
}

// Sort characters by vote count (descending)
function sortCharactersByVotes() {
    characters.sort((a, b) => b.votes - a.votes);
}

// Render characters to the page
function renderCharacters() {
    // Sort characters by votes first
    sortCharactersByVotes();
    
    cardsContainer.innerHTML = '';
    
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card';
        
        // Add selected class if this is the voted character
        if (character.id === currentVotedCharacterId) {
            card.classList.add('selected');
        }
        
        const isVoted = character.id === currentVotedCharacterId;
        const hasTicket = userTickets.some(ticket => ticket.characterId === character.id);
        
        let cardHTML = `<img class="character-image" src="${character.image}" alt="${character.name}">`;
        
        cardHTML += `
            <div class="card-content">
                <h3 class="character-name">${character.name}</h3>
                <p class="character-description">${character.description}</p>
                <div class="vote-count">${character.votes} Votes</div>
                <div class="card-actions">
                    <button class="vote-button ${isVoted ? 'voted' : ''}" 
                        onclick="voteForCharacter(${character.id})">${isVoted ? 'VOTED' : 'VOTE'}</button>
                    <button class="buy-button" onclick="openTicketModal(${character.id})">${hasTicket ? 'VIEW TICKET' : 'BUY TICKET'}</button>
                </div>
            </div>
        `;
        
        card.innerHTML = cardHTML;
        cardsContainer.appendChild(card);
    });
}

// Update stats display
function updateStats() {
    const totalVotes = characters.reduce((sum, character) => sum + character.votes, 0);
    
    totalVotesElement.textContent = totalVotes;
    ownedTicketsElement.textContent = userTickets.length;
}

// Hide loading screen
function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
}

// Show status message
function showStatusMessage(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.style.background = isSuccess ? 'rgba(0, 0, 0, 0.8)' : 'rgba(220, 53, 69, 0.9)';
    statusMessage.style.opacity = '1';
    
    setTimeout(() => {
        statusMessage.style.opacity = '0';
    }, 3000);
}

// Handle voting for a character
function voteForCharacter(characterId) {
    // Find the character
    const character = characters.find(char => char.id === characterId);
    
    if (!character) {
        showStatusMessage('Character not found!', false);
        return;
    }
    
    // If user is voting for the same character, unvote
    if (currentVotedCharacterId === characterId) {
        // Send unvote to Wix backend
        window.parent.postMessage({
            type: 'remove-vote',
            characterId: characterId,
            characterName: character.name
        }, '*');
        
        // Update local UI
        character.votes--;
        currentVotedCharacterId = null;
        renderCharacters();
        updateStats();
        showStatusMessage(`Vote for ${character.name} removed!`);
        return;
    }
    
    // If user already voted for a different character, remove that vote first
    if (currentVotedCharacterId !== null) {
        const previousCharacter = characters.find(char => char.id === currentVotedCharacterId);
        if (previousCharacter) {
            previousCharacter.votes--;
        }
        
        // Send unvote for previous character to Wix backend
        window.parent.postMessage({
            type: 'change-vote',
            oldCharacterId: currentVotedCharacterId,
            newCharacterId: characterId,
            newCharacterName: character.name
        }, '*');
    } else {
        // Send new vote to Wix backend
        window.parent.postMessage({
            type: 'cast-vote',
            characterId: characterId,
            characterName: character.name
        }, '*');
    }
    
    // Update local UI
    character.votes++;
    currentVotedCharacterId = characterId;
    renderCharacters();
    updateStats();
    showStatusMessage(`Vote cast for ${character.name}!`);
}

// Open the ticket purchase modal
function openTicketModal(characterId) {
    // Find the character
    const character = characters.find(char => char.id === characterId);
    
    if (!character) {
        showStatusMessage('Character not found!', false);
        return;
    }

    // Check if user already has this ticket
    const existingTicket = userTickets.find(ticket => ticket.characterId === characterId);
    
    if (existingTicket) {
        // Show the ticket they already own
        selectedCharacter = character;
        characterPreviewImage.src = character.image;
        characterPreviewName.textContent = character.name;
        characterTicketNumber.textContent = `TICKET #${existingTicket.ticketNumber}`;
        purchaseButton.textContent = 'VIEW IN WALLET';
        purchaseButton.onclick = () => viewTicketInWallet(existingTicket.tokenId);
    } else {
        // Set up purchase for new ticket
        selectedCharacter = character;
        characterPreviewImage.src = character.image;
        characterPreviewName.textContent = character.name;
        
        // Generate a preview ticket number (actual one will be assigned on purchase)
        const nextTicketNumber = getNextTicketNumber(character.ticketPrefix);
        characterTicketNumber.textContent = `TICKET #${nextTicketNumber}`;
        
        purchaseButton.textContent = `BUY TICKET ($${character.ticketPrice.toFixed(2)})`;
        purchaseButton.onclick = () => purchaseTicket(character.id);
    }
    
    // Show the modal
    ticketModal.style.display = 'flex';
}

// Get the next ticket number for a character
function getNextTicketNumber(prefix) {
    // Get the highest number for this character prefix
    const ticketsForCharacter = userTickets.filter(ticket => 
        ticket.ticketNumber.startsWith(prefix)
    );
    
    if (ticketsForCharacter.length === 0) {
        return `${prefix}-00001`;
    }
    
    // Find the highest number
    let highestNumber = 0;
    ticketsForCharacter.forEach(ticket => {
        const numberPart = ticket.ticketNumber.split('-')[1];
        const number = parseInt(numberPart, 10);
        if (number > highestNumber) {
            highestNumber = number;
        }
    });
    
    // Return next number with padding
    return `${prefix}-${(highestNumber + 1).toString().padStart(5, '0')}`;
}

// Try to initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startInitialization);
} else {
    startInitialization();
} 