            # Security Practices

## Storage Security

- All passwords are stored locally in browser's localStorage
- Master password is hashed before storage
- No data is transmitted to external servers

## Encryption

This implementation uses basic obfuscation for demonstration purposes. For production use:

1. Consider using Web Crypto API for stronger encryption
2. Implement proper key derivation functions (like PBKDF2)
3. Use authenticated encryption modes

## Best Practices for Users

1. Use a strong, unique master password
2. Regularly export backups of your passwords
3. Keep your browser updated
4. Use browser security features