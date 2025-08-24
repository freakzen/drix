// Configuration settings for CyberVault
const CONFIG = {
    // Encryption settings
    ENCRYPTION: {
        SALT: 'cybervault-salt-2023', // Change this in production!
        ITERATIONS: 10000, // For PBKDF2 (if implemented)
        KEY_LENGTH: 256 // For PBKDF2 (if implemented)
    },
    
    // App settings
    APP: {
        NAME: 'CyberVault',
        VERSION: '1.0.0',
        DEFAULT_TIMEOUT: 30 // Minutes until auto-logout
    },
    
    // Storage settings
    STORAGE: {
        PREFIX: 'cybervault_',
        BACKUP_INTERVAL: 24 // Hours between automatic backups
    },
    
    // UI settings
    UI: {
        THEME: 'hacker',
        ANIMATIONS: true,
        TYPING_EFFECT: true
    }
};

// Make config available globally
window.CONFIG = CONFIG;