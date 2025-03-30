# Alpha Social NFT Minter

A standalone NFT minting application for the Alpha Social Murder Mystery game.

## Deployment Instructions

### Deploying to Vercel

1. Install the Vercel CLI (optional but recommended):
   ```bash
   npm install -g vercel
   ```

2. Deploy using one of these methods:

   #### Method 1: Using Vercel CLI
   ```bash
   vercel
   ```

   #### Method 2: Using Vercel Dashboard
   1. Push your code to a GitHub repository
   2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
   3. Click "New Project"
   4. Import your GitHub repository
   5. Configure the project settings:
      - Framework Preset: Other
      - Build Command: (leave empty)
      - Output Directory: .
      - Install Command: (leave empty)
   6. Click "Deploy"

### Configuration

After deployment, you'll need to:

1. Update the `allowedOrigins` in `js/messaging.js` to include your Wix site's domain:
   ```javascript
   const allowedOrigins = [
       'https://your-wix-site.com',
       'https://editor.wix.com'
   ];
   ```

2. Update the contract address in `js/web3.js` if needed:
   ```javascript
   contractAddress: '0xYourContractAddress'
   ```

### Embedding in Wix

Add this HTML to your Wix page:
```html
<iframe 
    id="nftMintIframe" 
    src="https://your-vercel-app.vercel.app" 
    style="width: 100%; height: 600px; border: none;"
    allow="camera; microphone; accelerometer; autoplay; encrypted-media; geolocation; gyroscope; payment"
></iframe>
```

## Development

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser
3. Use a local development server (recommended):
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Using Node.js
   npx serve
   ```

### Testing

1. Connect MetaMask wallet
2. Switch to BASE Sepolia testnet
3. Test the minting process with test ETH

## Security Considerations

- Always validate message origins in postMessage handlers
- Keep contract addresses and other sensitive data in environment variables
- Regularly update dependencies
- Monitor for suspicious activity

## Support

For support, please contact the development team or create an issue in the repository. 