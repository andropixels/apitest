const express = require('express');
const router = express.Router();
const ethers = require('ethers');
const fs = require('fs');
const path = require('path');

// Using Infura mainnet provider
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/895d773d17f043008769af24d76f0ac1');

// Logging function
const logToFileAndConsole = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log('\x1b[36m%s\x1b[0m', logMessage);
    const logPath = path.join(__dirname, 'contract-api.log');
    fs.appendFileSync(logPath, logMessage);
};

// Common ABIs
const ABIS = {
    ERC20: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)"
    ],
    ERC721: [
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function balanceOf(address) view returns (uint256)",
        "function tokenURI(uint256) view returns (string)",
        "function ownerOf(uint256) view returns (address)"
    ],
    BASIC: [
        "function owner() view returns (address)",
        "function getBalance() view returns (uint256)",
        "function isActive() view returns (bool)"
    ]
};

// Get basic contract information
router.get('/niteshapitest/:address/basic', async (req, res) => {
    const startTime = Date.now();
    logToFileAndConsole('🚀 New Basic Contract Info Request Started');
    
    try {
        const { address } = req.params;
        
        logToFileAndConsole(`📍 Checking contract: ${address}`);

        if (!ethers.utils.isAddress(address)) {
            logToFileAndConsole(`❌ Invalid address: ${address}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid contract address'
            });
        }

        // Get contract details
        const code = await provider.getCode(address);
        const balance = await provider.getBalance(address);
        const txCount = await provider.getTransactionCount(address);

        const responseData = {
            address,
            isContract: code !== '0x',
            balance: ethers.utils.formatEther(balance),
            transactionCount: txCount.toString(),
            bytecodeSize: (code.length - 2) / 2, // subtract '0x' and convert to bytes
        };

        logToFileAndConsole('📊 Basic Contract Data Retrieved:');
        logToFileAndConsole(JSON.stringify(responseData, null, 2));
        logToFileAndConsole(`⏱️ Request completed in ${Date.now() - startTime}ms`);

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        logToFileAndConsole(`❌ Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get NFT (ERC721) contract information
router.get('/niteshapitest/:address/nft', async (req, res) => {
    const startTime = Date.now();
    logToFileAndConsole('🚀 New NFT Contract Info Request Started');
    
    try {
        const { address } = req.params;
        const tokenId = req.query.tokenId || 0;
        
        logToFileAndConsole(`📍 Checking NFT contract: ${address}, TokenID: ${tokenId}`);

        if (!ethers.utils.isAddress(address)) {
            logToFileAndConsole(`❌ Invalid address: ${address}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid contract address'
            });
        }

        const contract = new ethers.Contract(address, ABIS.ERC721, provider);
        
        const [name, symbol, tokenUriResponse] = await Promise.all([
            contract.name().catch(() => 'N/A'),
            contract.symbol().catch(() => 'N/A'),
            contract.tokenURI(tokenId).catch(() => 'N/A'),
        ]);

        const owner = await contract.ownerOf(tokenId).catch(() => 'N/A');

        const responseData = {
            address,
            name,
            symbol,
            tokenId,
            tokenUri: tokenUriResponse,
            owner
        };

        logToFileAndConsole('🎨 NFT Contract Data Retrieved:');
        logToFileAndConsole(JSON.stringify(responseData, null, 2));
        logToFileAndConsole(`⏱️ Request completed in ${Date.now() - startTime}ms`);

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        logToFileAndConsole(`❌ Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get token (ERC20) information
router.get('/niteshapitest/:address/token', async (req, res) => {
    const startTime = Date.now();
    logToFileAndConsole('🚀 New Token Contract Info Request Started');
    
    try {
        const { address } = req.params;
        
        logToFileAndConsole(`📍 Checking token contract: ${address}`);

        if (!ethers.utils.isAddress(address)) {
            logToFileAndConsole(`❌ Invalid address: ${address}`);
            return res.status(400).json({
                success: false,
                message: 'Invalid contract address'
            });
        }

        const contract = new ethers.Contract(address, ABIS.ERC20, provider);
        
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name().catch(() => 'N/A'),
            contract.symbol().catch(() => 'N/A'),
            contract.decimals().catch(() => 18),
            contract.totalSupply().catch(() => 'N/A')
        ]);

        const formattedSupply = totalSupply !== 'N/A' 
            ? ethers.utils.formatUnits(totalSupply, decimals)
            : 'N/A';

        const responseData = {
            address,
            name,
            symbol,
            decimals,
            totalSupply: formattedSupply
        };

        logToFileAndConsole('💰 Token Contract Data Retrieved:');
        logToFileAndConsole(JSON.stringify(responseData, null, 2));
        logToFileAndConsole(`⏱️ Request completed in ${Date.now() - startTime}ms`);

        res.status(200).json({
            success: true,
            data: responseData
        });

    } catch (error) {
        logToFileAndConsole(`❌ Error: ${error.message}`);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;