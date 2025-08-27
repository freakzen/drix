// Simple encryption function (for demonstration purposes)
// Note: This is a basic obfuscation
const simpleEncrypt = (text, key) => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
};

// Simple decryption function
const simpleDecrypt = (encryptedText, key) => {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
};

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginForm = document.getElementById('login-form');
const masterPasswordInput = document.getElementById('master-password');
const loginAlert = document.getElementById('login-alert');
const appAlert = document.getElementById('app-alert');
const passwordList = document.getElementById('password-list');
const searchInput = document.getElementById('search');
const addPasswordBtn = document.getElementById('add-password-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFile = document.getElementById('import-file');
const changeMasterBtn = document.getElementById('change-master-btn');
const logoutBtn = document.getElementById('logout-btn');
const passwordModal = document.getElementById('password-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const passwordForm = document.getElementById('password-form');
const serviceInput = document.getElementById('service');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const notesInput = document.getElementById('notes');
const editIdInput = document.getElementById('edit-id');
const changeMasterModal = document.getElementById('change-master-modal');
const closeMasterModalBtn = document.getElementById('close-master-modal');
const changeMasterForm = document.getElementById('change-master-form');
const currentMasterInput = document.getElementById('current-master');
const newMasterInput = document.getElementById('new-master');
const confirmMasterInput = document.getElementById('confirm-master');

// State
let masterPassword = '';
let passwords = [];

const initApp = () => {
    const masterHash = localStorage.getItem('masterPasswordHash');
    
    if (!masterHash) {
        document.querySelector('.terminal-text:last-child').textContent = 
            '> First access detected. Your input will become the master key.';
    }
    
    // Load passwords if they exist
    const encryptedPasswords = localStorage.getItem('passwords');
    if (encryptedPasswords && masterHash) {
        try {
            // For a real application, we would decrypt with the master password
            // For this demo, we're just storing as is
            passwords = JSON.parse(encryptedPasswords);
        } catch (e) {
            console.error('Error loading passwords:', e);
            passwords = [];
        }
    }
 
    loginForm.addEventListener('submit', handleLogin);
    addPasswordBtn.addEventListener('click', showAddModal);
    exportBtn.addEventListener('click', exportToCSV);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importFromCSV(e.target.files[0]);
        }
    });
    changeMasterBtn.addEventListener('click', showChangeMasterModal);
    logoutBtn.addEventListener('click', handleLogout);
    closeModalBtn.addEventListener('click', hideModal);
    closeMasterModalBtn.addEventListener('click', hideChangeMasterModal);
    passwordForm.addEventListener('submit', savePassword);
    changeMasterForm.addEventListener('submit', changeMasterPassword);
    searchInput.addEventListener('input', filterPasswords);
    

    window.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            hideModal();
        }
        if (e.target === changeMasterModal) {
            hideChangeMasterModal();
        }
    });
    
    // Add hacker typing effect to some elements
    typeWriterEffect();
};

// Typewriter effect for terminal text
const typeWriterEffect = () => {
    const terminalTexts = document.querySelectorAll('.terminal-text');
    terminalTexts.forEach((el, index) => {
        const text = el.textContent;
        el.textContent = '';
        
        setTimeout(() => {
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < text.length) {
                    el.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(typeInterval);
                }
            }, 50);
        }, index * 800);
    });
};

// Handle login
const handleLogin = (e) => {
    e.preventDefault();
    
    const inputPassword = masterPasswordInput.value;
    if (!inputPassword) {
        showAlert(loginAlert, '> ERROR: Authentication field empty', 'error');
        return;
    }
    
    // Check if master password is set
    const storedHash = localStorage.getItem('masterPasswordHash');
    
    if (!storedHash) {
        // First time user - set master password
        localStorage.setItem('masterPasswordHash', simpleEncrypt(inputPassword, 'salt'));
        masterPassword = inputPassword;
        showAppScreen();
        showAlert(appAlert, '> SUCCESS: Master key initialized. System secured.', 'success');
    } else {
        // Verify master password
        if (simpleDecrypt(storedHash, 'salt') === inputPassword) {
            masterPassword = inputPassword;
            showAppScreen();
            renderPasswords();
            showAlert(appAlert, '> ACCESS GRANTED. Welcome back.', 'success');
        } else {
            showAlert(loginAlert, '> ERROR: Invalid master key. Access denied.', 'error');
        }
    }
    
    // Clear the password field
    masterPasswordInput.value = '';
};

// Show the main application screen
const showAppScreen = () => {
    loginScreen.style.display = 'none';
    appScreen.style.display = 'block';
};

// Handle logout
const handleLogout = () => {
    masterPassword = '';
    appScreen.style.display = 'none';
    loginScreen.style.display = 'block';
    // Reset any forms
    passwordForm.reset();
    changeMasterForm.reset();
};

// Show modal for adding/editing passwords
const showAddModal = (id = null) => {
    if (id !== null) {
        // Editing existing password
        modalTitle.textContent = 'Edit Credential';
        const password = passwords.find(p => p.id === id);
        if (password) {
            editIdInput.value = password.id;
            serviceInput.value = password.service;
            usernameInput.value = password.username;
            passwordInput.value = password.password;
            notesInput.value = password.notes || '';
        }
    } else {
        // Adding new password
        modalTitle.textContent = 'Add New Credential';
        passwordForm.reset();
        editIdInput.value = '';
    }
    
    passwordModal.style.display = 'flex';
};

// Show change master password modal
const showChangeMasterModal = () => {
    changeMasterModal.style.display = 'flex';
    changeMasterForm.reset();
};

// Hide modal
const hideModal = () => {
    passwordModal.style.display = 'none';
};

// Hide change master password modal
const hideChangeMasterModal = () => {
    changeMasterModal.style.display = 'none';
};

// Save password (add or edit)
const savePassword = (e) => {
    e.preventDefault();
    
    const service = serviceInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const notes = notesInput.value.trim();
    const id = editIdInput.value || Date.now().toString();
    
    if (!service || !username || !password) {
        showAlert(appAlert, '> ERROR: Required fields missing', 'error');
        return;
    }
    
    const passwordData = {
        id,
        service,
        username,
        password,
        notes,
        createdAt: editIdInput.value ? undefined : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (editIdInput.value) {
        // Update existing password
        const index = passwords.findIndex(p => p.id === id);
        if (index !== -1) {
            passwords[index] = { ...passwords[index], ...passwordData };
        }
    } else {
        // Add new password
        passwords.push(passwordData);
    }
    
    // Save to localStorage
    localStorage.setItem('passwords', JSON.stringify(passwords));
    
    // Update UI
    renderPasswords();
    hideModal();
    showAlert(appAlert, `> SUCCESS: Credential ${editIdInput.value ? 'updated' : 'saved'} to vault`, 'success');
};

// Change master password
const changeMasterPassword = (e) => {
    e.preventDefault();
    
    const currentMaster = currentMasterInput.value;
    const newMaster = newMasterInput.value;
    const confirmMaster = confirmMasterInput.value;
    
    if (!currentMaster || !newMaster || !confirmMaster) {
        showAlert(appAlert, '> ERROR: All fields required', 'error');
        return;
    }
    
    // Verify current password
    const storedHash = localStorage.getItem('masterPasswordHash');
    if (simpleDecrypt(storedHash, 'salt') !== currentMaster) {
        showAlert(appAlert, '> ERROR: Current master key incorrect', 'error');
        return;
    }
    
    // Check if new passwords match
    if (newMaster !== confirmMaster) {
        showAlert(appAlert, '> ERROR: New keys do not match', 'error');
        return;
    }
    
    // Update master password
    localStorage.setItem('masterPasswordHash', simpleEncrypt(newMaster, 'salt'));
    masterPassword = newMaster;
    
    hideChangeMasterModal();
    showAlert(appAlert, '> SUCCESS: Master key updated. System re-secured.', 'success');
};

// Delete password
const deletePassword = (id) => {
    if (confirm('> CONFIRM: Delete this credential from vault?')) {
        passwords = passwords.filter(p => p.id !== id);
        localStorage.setItem('passwords', JSON.stringify(passwords));
        renderPasswords();
        showAlert(appAlert, '> SUCCESS: Credential deleted from vault', 'success');
    }
};

// Export passwords to CSV file
const exportToCSV = () => {
    if (passwords.length === 0) {
        showAlert(appAlert, "> ERROR: No passwords to export", "error");
        return;
    }

    // Create CSV content
    let csvContent = "Service,Username,Password,Notes\n";
    
    passwords.forEach(password => {
        csvContent += `"${escapeCsvField(password.service)}","${escapeCsvField(password.username)}","${escapeCsvField(password.password)}","${escapeCsvField(password.notes || '')}"\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "cybervault_passwords.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showAlert(appAlert, "> SUCCESS: Passwords exported to CSV", "success");
};

// Import passwords from CSV file
const importFromCSV = (file) => {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const csvData = e.target.result;
            const lines = csvData.split('\n');
            const newPasswords = [];
            
            // Skip header line
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                
                // Parse CSV line (handle quoted fields with commas)
                const values = parseCsvLine(lines[i]);
                
                if (values.length >= 3) {
                    newPasswords.push({
                        id: Date.now().toString() + i,
                        service: values[0].replace(/^"|"$/g, ''),
                        username: values[1].replace(/^"|"$/g, ''),
                        password: values[2].replace(/^"|"$/g, ''),
                        notes: values[3] ? values[3].replace(/^"|"$/g, '') : '',
                        createdAt: new Date().toISOString()
                    });
                }
            }
            
            if (newPasswords.length > 0) {
                // Ask for confirmation before importing
                if (confirm(`> CONFIRM: Import ${newPasswords.length} passwords?`)) {
                    passwords = [...passwords, ...newPasswords];
                    localStorage.setItem('passwords', JSON.stringify(passwords));
                    renderPasswords();
                    showAlert(appAlert, `> SUCCESS: ${newPasswords.length} passwords imported`, "success");
                }
            } else {
                showAlert(appAlert, "> ERROR: No valid passwords found in CSV", "error");
            }
        } catch (error) {
            showAlert(appAlert, "> ERROR: Invalid CSV format", "error");
            console.error("CSV import error:", error);
        }
    };
    
    reader.onerror = function() {
        showAlert(appAlert, "> ERROR: Failed to read file", "error");
    };
    
    reader.readAsText(file);
};

// Parse a CSV line, handling quoted fields
const parseCsvLine = (line) => {
    const values = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    values.push(currentValue);
    return values;
};

// Escape CSV field to handle commas and quotes
const escapeCsvField = (field) => {
    if (field.includes('"') || field.includes(',') || field.includes('\n')) {
        return '"' + field.replace(/"/g, '""') + '"';
    }
    return field;
};

// Render passwords list
const renderPasswords = () => {
    passwordList.innerHTML = '';
    
    if (passwords.length === 0) {
        passwordList.innerHTML = '<p class="terminal-text">> No credentials stored. Add your first entry to begin.</p>';
        return;
    }
    
    passwords.forEach(password => {
        const li = document.createElement('li');
        li.className = 'password-item';
        
        li.innerHTML = `
            <div class="password-details">
                <h3>${escapeHtml(password.service)}</h3>
                <p>Username: ${escapeHtml(password.username)}</p>
                <p>Password: ••••••••••</p>
                ${password.notes ? `<p>Notes: ${escapeHtml(password.notes)}</p>` : ''}
            </div>
            <div class="password-actions">
                <button class="hacker-btn show-password" data-id="${password.id}">> Reveal</button>
                <button class="hacker-btn edit-btn" data-id="${password.id}">> Edit</button>
                <button class="hacker-btn logout delete-btn" data-id="${password.id}">> Delete</button>
            </div>
        `;
        
        passwordList.appendChild(li);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            showAddModal(e.target.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            deletePassword(e.target.dataset.id);
        });
    });
    
    document.querySelectorAll('.show-password').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const password = passwords.find(p => p.id === id);
            if (password) {
                e.target.textContent = e.target.textContent === '> Reveal' ? 
                    `> ${password.password}` : '> Reveal';
                
                // Revert after 5 seconds
                setTimeout(() => {
                    if (e.target.textContent !== '> Reveal') {
                        e.target.textContent = '> Reveal';
                    }
                }, 5000);
            }
        });
    });
};

// Filter passwords based on search input
const filterPasswords = () => {
    const searchTerm = searchInput.value.toLowerCase();
    const items = passwordList.getElementsByClassName('password-item');
    
    Array.from(items).forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
};

// Show alert message
const showAlert = (element, message, type) => {
    element.textContent = message;
    element.className = `alert alert-${type}`;
    element.style.display = 'block';
    
    // Hide alert after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
};

// Escape HTML to prevent XSS
const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
