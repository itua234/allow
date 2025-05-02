const client = require('@util/client'); // Adjust path

class TokenVaultService {
    async storeToken(tokenId, mappingData) {
        try {
            const key = `token:${tokenId}`;
            const value = JSON.stringify(mappingData);
            // Consider encrypting the 'value' before storing in Redis for extra security
            await client.set(key, value);
            console.log(`Token ${tokenId} stored in Redis.`);
        } catch (error) {
            console.error('Error storing token in Redis:', error);
            throw error;
        }
    }

    async retrieveIdentity(tokenId) {
        try {
            const key = `token:${tokenId}`;
            const value = await client.get(key);
            if (value) {
                const mapping = JSON.parse(value);
                //return mapping.identityNumber;
                return mapping; 
            }
            return null;
        } catch (error) {
            console.error('Error retrieving identity from Redis:', error);
            throw error;
        }
    }

    async deleteToken(tokenId) {
        try {
            const key = `token:${tokenId}`;
            const deletedCount = await client.del(key);
            return deletedCount > 0;
        } catch (error) {
            console.error('Error deleting token from Redis:', error);
            throw error;
        }
    }
}

module.exports = new TokenVaultService();