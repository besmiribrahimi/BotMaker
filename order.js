// ============================================
// ORDER PAGE - DISCORD WEBHOOK
// ============================================
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1467566032938860615/N3CpHUAP_d59bPlvZ6j4-lk1Tqld5GzRgEHKA_FZVx-Q1dZVV7lNCUYffXwD3gTCbgAf';

// ============================================
// STATE MANAGEMENT
// ============================================
let currentStep = 1;
let orderData = {
    botType: null,
    basePrice: 0,
    features: [],
    addons: [],
    specialRequests: '',
    customerInfo: {},
    isPreset: false,
    presetName: null,
    monthlyPrice: null,
    isIntegration: false,
    selectedTier: null
};

// ============================================
// STEP NAVIGATION
// ============================================
const steps = document.querySelectorAll('.step');
const stepContents = document.querySelectorAll('.step-content');
const stepLines = document.querySelectorAll('.step-line');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

function updateSteps() {
    // Update step indicators
    steps.forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            step.classList.add('completed');
        } else if (stepNum === currentStep) {
            step.classList.add('active');
        }
    });
    
    // Update step lines
    stepLines.forEach((line, index) => {
        if (index < currentStep - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });
    
    // Update content visibility
    stepContents.forEach((content, index) => {
        content.classList.remove('active');
        if (index + 1 === currentStep) {
            content.classList.add('active');
        }
    });
    
    // Update navigation buttons
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === 4) {
        nextBtn.style.display = 'none';
        updateOrderSummary();
    } else {
        nextBtn.style.display = 'flex';
    }
}

function nextStep() {
    // Validation
    if (currentStep === 1 && !orderData.botType) {
        alert('Please select a bot type to continue');
        return;
    }
    
    if (currentStep < 4) {
        // Skip step 2 if preset plan is selected
        if (currentStep === 1 && orderData.isPreset) {
            currentStep = 3;
        } else {
            currentStep++;
        }
        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Skip step 2 if preset plan is selected (go from 3 to 1)
        if (currentStep === 3 && orderData.isPreset) {
            currentStep = 1;
        } else {
            currentStep--;
        }
        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

nextBtn.addEventListener('click', nextStep);
prevBtn.addEventListener('click', prevStep);

// ============================================
// PRESET PLAN SELECTION
// ============================================
const presetPlanCards = document.querySelectorAll('.preset-plan-card');
const presetPrices = {
    'starter-plan': { base: 15, monthly: 5, name: 'Starter Bot' },
    'growth-plan': { base: 35, monthly: 10, name: 'Growth Bot' },
    'pro-plan': { base: 80, monthly: 20, name: 'Pro Bot' }
};

// Detailed preset plan info for modal
const presetDetails = {
    'starter-plan': {
        badge: 'Starter',
        name: 'Starter Bot',
        interactions: 'Up to 1,000 interactions/month',
        basePrice: 15,
        monthly: 5,
        features: [
            'Custom commands (up to 10)',
            'Basic moderation (kick, ban, mute)',
            'Simple database storage',
            'Basic logging system',
            'Welcome messages',
            '24/7 uptime guarantee',
            'Basic support (48h response)'
        ]
    },
    'growth-plan': {
        badge: 'Growth',
        name: 'Growth Bot',
        interactions: 'Up to 10,000 interactions/month',
        basePrice: 35,
        monthly: 10,
        hostingIncluded: true,
        features: [
            'Everything in Starter plan',
            'Unlimited custom commands',
            'Advanced moderation (auto-mod, warnings)',
            'Reaction roles system',
            'Welcome system with images',
            'Leveling system (basic)',
            'Custom embed messages',
            '24/7 Hosting included',
            'Priority support (24h response)'
        ]
    },
    'pro-plan': {
        badge: 'Pro',
        name: 'Pro Bot',
        interactions: 'Up to 50,000 interactions/month',
        basePrice: 80,
        monthly: 20,
        hostingIncluded: true,
        features: [
            'Everything in Growth plan',
            'Full ticket support system',
            'Economy & leveling system',
            'Custom dashboard access',
            'Advanced analytics',
            'Giveaway system',
            'Music playback (YouTube, Spotify)',
            '24/7 Hosting included',
            'Premium support (4h response)'
        ]
    }
};

// Modal elements
const presetModal = document.getElementById('presetModal');
const modalClose = document.getElementById('modalClose');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');
let pendingPresetCard = null;

function showPresetModal(type) {
    const details = presetDetails[type];
    
    document.getElementById('modalBadge').textContent = details.badge;
    document.getElementById('modalTitle').textContent = details.name;
    document.getElementById('modalInteractions').textContent = details.interactions;
    document.getElementById('modalBasePrice').textContent = `€${details.basePrice}`;
    document.getElementById('modalMonthly').textContent = `+ €${details.monthly}/mo hosting`;
    
    const featuresList = document.getElementById('modalFeatures');
    featuresList.innerHTML = details.features.map(f => `<li>${f}</li>`).join('');
    
    presetModal.classList.add('active');
}

function hidePresetModal() {
    presetModal.classList.remove('active');
    pendingPresetCard = null;
}

modalClose.addEventListener('click', hidePresetModal);
modalCancel.addEventListener('click', hidePresetModal);
presetModal.addEventListener('click', (e) => {
    if (e.target === presetModal) hidePresetModal();
});

modalConfirm.addEventListener('click', () => {
    if (pendingPresetCard) {
        const card = pendingPresetCard;
        
        // Deselect all and select this one
        presetPlanCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        botTypeCards.forEach(c => c.classList.add('disabled'));
        
        const type = card.dataset.type;
        orderData.botType = type;
        orderData.basePrice = presetPrices[type].base;
        orderData.isPreset = true;
        orderData.presetName = presetPrices[type].name;
        orderData.monthlyPrice = presetPrices[type].monthly;
        
        updatePriceCalculator();
        hidePresetModal();
        
        // Skip to step 3 (add-ons) - skipping features step
        currentStep = 3;
        updateSteps();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

presetPlanCards.forEach(card => {
    card.addEventListener('click', () => {
        // Check if custom bot is selected - if so, do nothing
        const customSelected = Array.from(botTypeCards).some(c => c.classList.contains('selected'));
        if (customSelected) return;
        
        // If already selected, deselect it
        if (card.classList.contains('selected')) {
            presetPlanCards.forEach(c => c.classList.remove('selected'));
            botTypeCards.forEach(c => c.classList.remove('disabled'));
            orderData.botType = null;
            orderData.basePrice = 0;
            orderData.isPreset = false;
            orderData.presetName = null;
            orderData.monthlyPrice = null;
            updatePriceCalculator();
            return;
        }
        
        // Show modal for new selection
        pendingPresetCard = card;
        showPresetModal(card.dataset.type);
    });
});

// ============================================
// BOT TYPE SELECTION (Custom)
// ============================================
const botTypeCards = document.querySelectorAll('.bot-type-card');
const basePrices = {
    moderation: 25,
    music: 35,
    economy: 45,
    leveling: 30,
    ticket: 25,
    multipurpose: 100,
    giveaway: 20,
    'roblox-discord': 27,
    'twitch-discord': 27,
    'youtube-discord': 27,
    'minecraft-discord': 27,
    'web-dashboard': 20,
    custom: 0
};

// Integration types that have special modals
const integrationTypes = ['roblox-discord', 'twitch-discord', 'youtube-discord', 'minecraft-discord', 'web-dashboard'];

// Roblox Modal elements
const robloxModal = document.getElementById('robloxModal');
const robloxModalClose = document.getElementById('robloxModalClose');
const robloxModalCancel = document.getElementById('robloxModalCancel');
const robloxModalConfirm = document.getElementById('robloxModalConfirm');

// Twitch Modal elements
const twitchModal = document.getElementById('twitchModal');
const twitchModalClose = document.getElementById('twitchModalClose');
const twitchModalCancel = document.getElementById('twitchModalCancel');
const twitchModalConfirm = document.getElementById('twitchModalConfirm');

// YouTube Modal elements
const youtubeModal = document.getElementById('youtubeModal');
const youtubeModalClose = document.getElementById('youtubeModalClose');
const youtubeModalCancel = document.getElementById('youtubeModalCancel');
const youtubeModalConfirm = document.getElementById('youtubeModalConfirm');

// Minecraft Modal elements
const minecraftModal = document.getElementById('minecraftModal');
const minecraftModalClose = document.getElementById('minecraftModalClose');
const minecraftModalCancel = document.getElementById('minecraftModalCancel');
const minecraftModalConfirm = document.getElementById('minecraftModalConfirm');

// Dashboard Modal elements
const dashboardModal = document.getElementById('dashboardModal');
const dashboardModalClose = document.getElementById('dashboardModalClose');
const dashboardModalCancel = document.getElementById('dashboardModalCancel');
const dashboardModalConfirm = document.getElementById('dashboardModalConfirm');

let pendingIntegrationCard = null;

// Modal show/hide functions
function showIntegrationModal(type) {
    const modals = {
        'roblox-discord': robloxModal,
        'twitch-discord': twitchModal,
        'youtube-discord': youtubeModal,
        'minecraft-discord': minecraftModal,
        'web-dashboard': dashboardModal
    };
    if (modals[type]) {
        modals[type].classList.add('active');
    }
}

function hideAllIntegrationModals() {
    [robloxModal, twitchModal, youtubeModal, minecraftModal, dashboardModal].forEach(modal => {
        if (modal) modal.classList.remove('active');
    });
    pendingIntegrationCard = null;
}

// Setup modal close buttons
[robloxModalClose, twitchModalClose, youtubeModalClose, minecraftModalClose, dashboardModalClose].forEach(btn => {
    if (btn) btn.addEventListener('click', hideAllIntegrationModals);
});

[robloxModalCancel, twitchModalCancel, youtubeModalCancel, minecraftModalCancel, dashboardModalCancel].forEach(btn => {
    if (btn) btn.addEventListener('click', hideAllIntegrationModals);
});

// Close on overlay click
[robloxModal, twitchModal, youtubeModal, minecraftModal, dashboardModal].forEach(modal => {
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) hideAllIntegrationModals();
        });
    }
});

// Tier selection data
const integrationTierConfigs = {
    'roblox-discord': { containerId: 'robloxTiers', radioName: 'roblox-tier' },
    'twitch-discord': { containerId: 'twitchTiers', radioName: 'twitch-tier' },
    'youtube-discord': { containerId: 'youtubeTiers', radioName: 'youtube-tier' },
    'minecraft-discord': { containerId: 'minecraftTiers', radioName: 'minecraft-tier' },
    'web-dashboard': { containerId: 'dashboardTiers', radioName: 'dashboard-tier' }
};

// Get selected tier price for an integration
function getSelectedTierPrice(type) {
    const config = integrationTierConfigs[type];
    if (!config) return basePrices[type] || 0;
    
    const selectedRadio = document.querySelector(`input[name="${config.radioName}"]:checked`);
    if (selectedRadio) {
        const tierDiv = selectedRadio.closest('.tier');
        return parseInt(tierDiv.dataset.price) || basePrices[type];
    }
    return basePrices[type]; // Default to base price
}

// Get selected tier name
function getSelectedTierName(type) {
    const config = integrationTierConfigs[type];
    if (!config) return 'Basic';
    
    const selectedRadio = document.querySelector(`input[name="${config.radioName}"]:checked`);
    if (selectedRadio) {
        return selectedRadio.value.charAt(0).toUpperCase() + selectedRadio.value.slice(1);
    }
    return 'Basic';
}

// Confirm button handler for all integration modals
function handleIntegrationConfirm(type) {
    if (pendingIntegrationCard) {
        const card = pendingIntegrationCard;
        const integrationType = type || card.dataset.type;
        
        // Check if a tier is selected
        const config = integrationTierConfigs[integrationType];
        const selectedRadio = document.querySelector(`input[name="${config.radioName}"]:checked`);
        
        if (!selectedRadio) {
            alert('Please select a tier to continue');
            return;
        }
        
        const tierPrice = getSelectedTierPrice(integrationType);
        const tierName = getSelectedTierName(integrationType);
        
        // Deselect all and select this one
        botTypeCards.forEach(c => c.classList.remove('selected'));
        presetPlanCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        presetPlanCards.forEach(c => c.classList.add('disabled'));
        
        orderData.botType = integrationType;
        orderData.basePrice = tierPrice;
        orderData.isPreset = false;
        orderData.presetName = null;
        orderData.monthlyPrice = null;
        orderData.selectedTier = tierName;
        orderData.isIntegration = true;
        
        updatePriceCalculator();
        hideAllIntegrationModals();
    }
}

// Setup confirm buttons with specific type
if (robloxModalConfirm) robloxModalConfirm.addEventListener('click', () => handleIntegrationConfirm('roblox-discord'));
if (twitchModalConfirm) twitchModalConfirm.addEventListener('click', () => handleIntegrationConfirm('twitch-discord'));
if (youtubeModalConfirm) youtubeModalConfirm.addEventListener('click', () => handleIntegrationConfirm('youtube-discord'));
if (minecraftModalConfirm) minecraftModalConfirm.addEventListener('click', () => handleIntegrationConfirm('minecraft-discord'));
if (dashboardModalConfirm) dashboardModalConfirm.addEventListener('click', () => handleIntegrationConfirm('web-dashboard'));

// Setup tier click to select radio
document.querySelectorAll('.tier.selectable').forEach(tier => {
    tier.addEventListener('click', () => {
        const radio = tier.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            // Update visual selection
            const parent = tier.closest('.selectable-tiers');
            if (parent) {
                parent.querySelectorAll('.tier').forEach(t => t.classList.remove('selected'));
                tier.classList.add('selected');
            }
        }
    });
});

// Feature mappings for each bot type - these features will be included automatically
const botTypeFeatures = {
    moderation: ['automod', 'warnings', 'logging', 'antiraid'],
    music: ['music'],
    economy: ['currency', 'shop', 'gambling', 'inventory'],
    leveling: ['levels', 'welcome'],
    ticket: ['tickets', 'transcripts', 'feedback'],
    giveaway: ['giveaways'],
    multipurpose: [] // All features included, skip to add-ons
};

// Function to auto-select and disable features based on bot type
function updateFeaturesForBotType(botType) {
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox input');
    const includedFeatures = botTypeFeatures[botType] || [];
    
    featureCheckboxes.forEach(checkbox => {
        const featureName = checkbox.value;
        const label = checkbox.closest('.feature-checkbox');
        
        if (includedFeatures.includes(featureName)) {
            // This feature is included with the bot type - check and disable
            checkbox.checked = true;
            checkbox.disabled = true;
            label.classList.add('included');
            
            // Add to orderData if not already there (price = 0 since included)
            if (!orderData.features.find(f => f.name === featureName)) {
                orderData.features.push({ name: featureName, price: 0, included: true });
            }
        } else {
            // Reset this feature
            checkbox.disabled = false;
            label.classList.remove('included');
            
            // Remove if it was an included feature before
            const existingFeature = orderData.features.find(f => f.name === featureName && f.included);
            if (existingFeature) {
                checkbox.checked = false;
                orderData.features = orderData.features.filter(f => f.name !== featureName);
            }
        }
    });
    
    updateSelectAllButtons();
}

// Function to reset all features to default state
function resetFeatures() {
    const featureCheckboxes = document.querySelectorAll('.feature-checkbox input');
    
    featureCheckboxes.forEach(checkbox => {
        const label = checkbox.closest('.feature-checkbox');
        checkbox.disabled = false;
        label.classList.remove('included');
        
        // Only uncheck if it was an "included" feature
        const existingFeature = orderData.features.find(f => f.name === checkbox.value && f.included);
        if (existingFeature) {
            checkbox.checked = false;
        }
    });
    
    // Remove all included features from orderData
    orderData.features = orderData.features.filter(f => !f.included);
    updateSelectAllButtons();
}

botTypeCards.forEach(card => {
    card.addEventListener('click', () => {
        // Check if disabled (preset is selected) - if so, do nothing
        if (card.classList.contains('disabled')) return;
        
        // Check if preset plan is selected - if so, do nothing
        const presetSelected = Array.from(presetPlanCards).some(c => c.classList.contains('selected'));
        if (presetSelected) return;
        
        const type = card.dataset.type;
        
        // If clicking on an integration type, show special modal
        if (integrationTypes.includes(type) && !card.classList.contains('selected')) {
            pendingIntegrationCard = card;
            showIntegrationModal(type);
            return;
        }
        
        // Toggle selection for custom bot cards
        const wasSelected = card.classList.contains('selected');
        botTypeCards.forEach(c => c.classList.remove('selected'));
        
        if (wasSelected) {
            // Deselecting - enable preset cards
            presetPlanCards.forEach(c => c.classList.remove('disabled'));
            orderData.botType = null;
            orderData.basePrice = 0;
            orderData.isPreset = false;
            orderData.presetName = null;
            orderData.monthlyPrice = null;
            orderData.isIntegration = false;
            orderData.selectedTier = null;
            orderData.isMultipurpose = false;
            
            // Reset features
            resetFeatures();
        } else {
            // Selecting - disable preset cards
            card.classList.add('selected');
            presetPlanCards.forEach(c => c.classList.add('disabled'));
            
            orderData.botType = type;
            orderData.basePrice = basePrices[type];
            orderData.isPreset = false;
            orderData.presetName = null;
            orderData.monthlyPrice = null;
            orderData.isIntegration = false;
            orderData.selectedTier = null;
            orderData.isMultipurpose = (type === 'multipurpose');
            
            // Auto-select features for this bot type
            updateFeaturesForBotType(type);
            
            // If multipurpose, skip to add-ons (step 3)
            if (type === 'multipurpose') {
                setTimeout(() => {
                    currentStep = 3;
                    updateSteps();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 300);
            }
        }
        
        updatePriceCalculator();
    });
});

// ============================================
// FEATURE SELECTION
// ============================================
const featureCheckboxes = document.querySelectorAll('.feature-checkbox input');

featureCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const feature = checkbox.value;
        const price = parseInt(checkbox.dataset.price);
        
        if (checkbox.checked) {
            orderData.features.push({ name: feature, price: price });
        } else {
            orderData.features = orderData.features.filter(f => f.name !== feature);
        }
        
        updatePriceCalculator();
        updateSelectAllButtons();
    });
});

// ============================================
// SELECT ALL BUTTONS
// ============================================
const selectAllBtns = document.querySelectorAll('.select-all-btn');

function updateSelectAllButtons() {
    selectAllBtns.forEach(btn => {
        const category = btn.closest('.feature-category');
        const checkboxes = category.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked && checkboxes.length > 0) {
            btn.textContent = 'Deselect All';
            btn.classList.add('deselect');
        } else {
            btn.textContent = 'Select All';
            btn.classList.remove('deselect');
        }
    });
}

selectAllBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const category = btn.closest('.feature-category');
        const checkboxes = category.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        checkboxes.forEach(checkbox => {
            const shouldCheck = !allChecked;
            
            if (checkbox.checked !== shouldCheck) {
                checkbox.checked = shouldCheck;
                
                const feature = checkbox.value;
                const price = parseInt(checkbox.dataset.price);
                
                if (shouldCheck) {
                    if (!orderData.features.find(f => f.name === feature)) {
                        orderData.features.push({ name: feature, price: price });
                    }
                } else {
                    orderData.features = orderData.features.filter(f => f.name !== feature);
                }
            }
        });
        
        updatePriceCalculator();
        updateSelectAllButtons();
    });
});

// ============================================
// ADDON SELECTION
// ============================================
const addonCards = document.querySelectorAll('.addon-card');

// API Addon Modal elements
const apiAddonModal = document.getElementById('apiAddonModal');
const apiAddonModalClose = document.getElementById('apiAddonModalClose');
const apiAddonModalClose2 = document.getElementById('apiAddonModalClose2');
const apiAddonModalConfirm = document.getElementById('apiAddonModalConfirm');
const apiAddonInfoBtn = document.querySelector('.addon-info-btn');
const apiAddonCard = document.querySelector('.addon-card.api-addon');
const hostingAddonCard = document.querySelector('.addon-card[data-addon="hosting"]');

// Function to disable/enable Hosting addon based on preset selection
function updateHostingAddonState() {
    if (!hostingAddonCard) return;
    
    // Check if preset with hosting included is selected (Growth or Pro plan)
    const hostingIncludedPresets = ['growth-plan', 'pro-plan'];
    const hasHostingIncluded = orderData.isPreset && hostingIncludedPresets.includes(orderData.botType);
    
    if (hasHostingIncluded) {
        // Preset with hosting - disable hosting addon
        hostingAddonCard.classList.add('disabled');
        hostingAddonCard.classList.remove('selected');
        // Remove from addons if it was selected
        orderData.addons = orderData.addons.filter(a => a.name !== 'hosting');
        
        // Add indicator
        let indicator = hostingAddonCard.querySelector('.included-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'included-indicator';
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Included with Plan';
            hostingAddonCard.appendChild(indicator);
        }
    } else {
        // Enable hosting addon
        hostingAddonCard.classList.remove('disabled');
        const indicator = hostingAddonCard.querySelector('.included-indicator');
        if (indicator) indicator.remove();
    }
}

// Function to disable/enable API addon based on integration selection
function updateApiAddonState() {
    if (!apiAddonCard) return;
    
    if (orderData.isIntegration) {
        // Integration selected - disable API addon (it's already included)
        apiAddonCard.classList.add('disabled');
        apiAddonCard.classList.remove('selected');
        // Remove from addons if it was selected
        orderData.addons = orderData.addons.filter(a => a.name !== 'api');
        
        // Add a tooltip/indicator
        let indicator = apiAddonCard.querySelector('.included-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'included-indicator';
            indicator.innerHTML = '<i class="fas fa-check-circle"></i> Included with Integration';
            apiAddonCard.appendChild(indicator);
        }
    } else {
        // No integration - enable API addon
        apiAddonCard.classList.remove('disabled');
        const indicator = apiAddonCard.querySelector('.included-indicator');
        if (indicator) indicator.remove();
    }
}

function showApiAddonModal() {
    if (apiAddonModal) {
        // Don't show modal if disabled (integration selected)
        if (apiAddonCard && apiAddonCard.classList.contains('disabled')) {
            return;
        }
        apiAddonModal.classList.add('active');
        updateApiModalButton();
    }
}

function updateApiModalButton() {
    const selectedApiType = document.querySelector('input[name="api-type"]:checked');
    
    if (apiAddonCard && apiAddonCard.classList.contains('selected')) {
        apiAddonModalConfirm.textContent = 'Remove from Order';
        apiAddonModalConfirm.classList.add('remove-mode');
    } else if (selectedApiType) {
        const price = selectedApiType.closest('.api-type-option').dataset.price;
        apiAddonModalConfirm.textContent = `Add to Order (+€${price})`;
        apiAddonModalConfirm.classList.remove('remove-mode');
    } else {
        apiAddonModalConfirm.textContent = 'Select an API Type';
        apiAddonModalConfirm.classList.remove('remove-mode');
    }
}

function hideApiAddonModal() {
    if (apiAddonModal) {
        apiAddonModal.classList.remove('active');
    }
}

if (apiAddonModalClose) apiAddonModalClose.addEventListener('click', hideApiAddonModal);
if (apiAddonModalClose2) apiAddonModalClose2.addEventListener('click', hideApiAddonModal);
if (apiAddonModal) {
    apiAddonModal.addEventListener('click', (e) => {
        if (e.target === apiAddonModal) hideApiAddonModal();
    });
}

// Info button click - show modal without toggling selection
if (apiAddonInfoBtn) {
    apiAddonInfoBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Don't trigger card click
        showApiAddonModal();
    });
}

// API type selection change - update button
document.querySelectorAll('input[name="api-type"]').forEach(radio => {
    radio.addEventListener('change', updateApiModalButton);
});

// Click on API type option to select it
document.querySelectorAll('.api-type-option').forEach(option => {
    option.addEventListener('click', () => {
        const radio = option.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            updateApiModalButton();
        }
    });
});

// Confirm button in modal - add/remove addon
if (apiAddonModalConfirm) {
    apiAddonModalConfirm.addEventListener('click', () => {
        if (apiAddonCard) {
            // If already selected, remove it
            if (apiAddonCard.classList.contains('selected')) {
                apiAddonCard.classList.remove('selected');
                orderData.addons = orderData.addons.filter(a => a.name !== 'api');
                // Clear the radio selection
                document.querySelectorAll('input[name="api-type"]').forEach(r => r.checked = false);
                // Reset the price display
                const priceEl = apiAddonCard.querySelector('.addon-price');
                if (priceEl) priceEl.textContent = 'Select Type →';
                updatePriceCalculator();
                hideApiAddonModal();
                return;
            }
            
            // Check if an API type is selected
            const selectedApiType = document.querySelector('input[name="api-type"]:checked');
            if (!selectedApiType) {
                alert('Please select an API type');
                return;
            }
            
            const apiType = selectedApiType.value;
            const price = parseInt(selectedApiType.closest('.api-type-option').dataset.price);
            
            apiAddonCard.classList.add('selected');
            apiAddonCard.dataset.price = price;
            
            // Update the price display on the card
            const priceEl = apiAddonCard.querySelector('.addon-price');
            if (priceEl) priceEl.textContent = `+€${price}`;
            
            // Store the API type name for summary
            orderData.addons.push({ 
                name: 'api', 
                price: price, 
                apiType: apiType.charAt(0).toUpperCase() + apiType.slice(1) + ' API'
            });
            
            updatePriceCalculator();
        }
        hideApiAddonModal();
    });
}

addonCards.forEach(card => {
    card.addEventListener('click', (e) => {
        // If card is disabled, don't do anything
        if (card.classList.contains('disabled')) {
            return;
        }
        
        // If clicking the API addon card (but not the info button), show modal instead
        if (card.classList.contains('api-addon') && !e.target.classList.contains('addon-info-btn')) {
            showApiAddonModal();
            return;
        }
        
        card.classList.toggle('selected');
        
        const addon = card.dataset.addon;
        const price = parseInt(card.dataset.price);
        
        if (card.classList.contains('selected')) {
            orderData.addons.push({ name: addon, price: price });
        } else {
            orderData.addons = orderData.addons.filter(a => a.name !== addon);
        }
        
        updatePriceCalculator();
    });
});

// ============================================
// PRICE CALCULATOR
// ============================================
const calcItems = document.getElementById('calcItems');
const totalPriceEl = document.getElementById('totalPrice');
const basePriceEl = document.getElementById('basePrice');

function updatePriceCalculator() {
    let html = '';
    let total = 0;
    
    // Update API addon state based on integration selection
    updateApiAddonState();
    
    // Update Hosting addon state based on preset selection (Growth/Pro include hosting)
    updateHostingAddonState();
    
    // Base price
    if (orderData.botType) {
        if (orderData.isPreset && orderData.presetName) {
            html += `<div class="calc-item"><span>${orderData.presetName}</span><span>€${orderData.basePrice}</span></div>`;
            html += `<div class="calc-item"><span>Monthly Fee</span><span>€${orderData.monthlyPrice}/mo</span></div>`;
        } else if (orderData.isIntegration) {
            const typeName = orderData.botType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ↔ ');
            const tierText = orderData.selectedTier ? ` (${orderData.selectedTier})` : '';
            html += `<div class="calc-item"><span>${typeName}${tierText}</span><span>€${orderData.basePrice}</span></div>`;
        } else {
            const typeName = orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1).replace('-', ' ');
            html += `<div class="calc-item"><span>${typeName} Bot</span><span>€${orderData.basePrice}</span></div>`;
        }
        total += orderData.basePrice;
    } else {
        html += `<div class="calc-item"><span>Base Price</span><span>€0</span></div>`;
    }
    
    // Features
    orderData.features.forEach(feature => {
        const name = feature.name.charAt(0).toUpperCase() + feature.name.slice(1);
        html += `<div class="calc-item"><span>${name}</span><span>+€${feature.price}</span></div>`;
        total += feature.price;
    });
    
    // Addons
    orderData.addons.forEach(addon => {
        let name = addon.name.charAt(0).toUpperCase() + addon.name.slice(1);
        // Show API type name if it's an API addon
        if (addon.name === 'api' && addon.apiType) {
            name = addon.apiType;
        }
        const isMonthly = addon.name === 'hosting';
        html += `<div class="calc-item"><span>${name}</span><span>+€${addon.price}${isMonthly ? '/mo' : ''}</span></div>`;
        total += addon.price;
    });
    
    calcItems.innerHTML = html;
    totalPriceEl.textContent = '€' + total;
}

// ============================================
// ORDER SUMMARY
// ============================================
function updateOrderSummary() {
    // Bot type
    const botTypeEl = document.getElementById('summaryBotType');
    if (orderData.isPreset && orderData.presetName) {
        const monthlyText = orderData.monthlyPrice ? ' + €' + orderData.monthlyPrice + '/mo' : '';
        botTypeEl.innerHTML = '<strong style="color: var(--accent-cyan);">' + orderData.presetName + ' Plan</strong> (€' + orderData.basePrice + monthlyText + ')';
    } else if (orderData.isIntegration) {
        const typeName = orderData.botType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ↔ ');
        const tierText = orderData.selectedTier ? ` (${orderData.selectedTier})` : '';
        botTypeEl.innerHTML = '<strong style="color: var(--accent-purple);">' + typeName + tierText + '</strong> (€' + orderData.basePrice + ')';
    } else if (orderData.botType) {
        botTypeEl.textContent = orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1) + ' Bot (€' + orderData.basePrice + ')';
    } else {
        botTypeEl.textContent = 'Not selected';
    }
    
    // Features
    const featuresEl = document.getElementById('summaryFeatures');
    if (orderData.features.length > 0) {
        featuresEl.innerHTML = orderData.features.map(f => {
            const name = f.name.charAt(0).toUpperCase() + f.name.slice(1);
            return `<li>${name} (+€${f.price})</li>`;
        }).join('');
    } else {
        featuresEl.innerHTML = '<li style="opacity: 0.5;">No features selected</li>';
    }
    
    // Addons
    const addonsEl = document.getElementById('summaryAddons');
    if (orderData.addons.length > 0) {
        addonsEl.innerHTML = orderData.addons.map(a => {
            let name = a.name.charAt(0).toUpperCase() + a.name.slice(1);
            // Show API type name if it's an API addon
            if (a.name === 'api' && a.apiType) {
                name = a.apiType;
            }
            const isMonthly = a.name === 'hosting';
            return `<li>${name} (+€${a.price}${isMonthly ? '/mo' : ''})</li>`;
        }).join('');
    } else {
        addonsEl.innerHTML = '<li style="opacity: 0.5;">No add-ons selected</li>';
    }
    
    // Total
    let total = orderData.basePrice;
    orderData.features.forEach(f => total += f.price);
    orderData.addons.forEach(a => total += a.price);
    
    document.getElementById('summaryTotal').textContent = '€' + total;
}

// ============================================
// SPECIAL REQUESTS
// ============================================
const specialRequestsInput = document.getElementById('specialRequests');
if (specialRequestsInput) {
    specialRequestsInput.addEventListener('input', () => {
        orderData.specialRequests = specialRequestsInput.value;
    });
}

// ============================================
// SUBMIT ORDER
// ============================================
const submitBtn = document.getElementById('submitOrder');

submitBtn.addEventListener('click', async () => {
    // Get form values
    const discordUser = document.getElementById('discordUser').value.trim();
    const discordId = document.getElementById('discordId').value.trim();
    const serverInvite = document.getElementById('serverInvite').value.trim();
    const memberCount = document.getElementById('memberCount').value.trim();
    const vcWilling = document.querySelector('input[name="vcWilling"]:checked')?.value || 'no';
    const ageCheck = document.getElementById('ageCheck').checked;
    
    // Validation
    if (!discordUser || !discordId || !serverInvite || !memberCount) {
        alert('Please fill in all required fields');
        return;
    }
    
    if (!ageCheck) {
        alert('You must confirm you are 17 years or older');
        return;
    }
    
    if (!orderData.botType) {
        alert('Please select a bot type');
        return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Submitting...</span>';
    
    // Calculate total
    let total = orderData.basePrice;
    orderData.features.forEach(f => total += f.price);
    orderData.addons.forEach(a => total += a.price);
    
    // Create embed
    const embed = {
        title: '🎉 New Bot Order from Configuration Studio!',
        color: 0x00ff88,
        fields: [
            {
                name: '👤 Discord User',
                value: discordUser,
                inline: true
            },
            {
                name: '🆔 User ID',
                value: discordId,
                inline: true
            },
            {
                name: '🔗 Server Invite',
                value: serverInvite,
                inline: true
            },
            {
                name: '👥 Member Count',
                value: memberCount + ' members',
                inline: true
            },
            {
                name: '🎙️ Willing to VC',
                value: vcWilling === 'yes' ? '✅ Yes' : '❌ No',
                inline: true
            },
            {
                name: '🤖 Bot Type',
                value: orderData.isPreset 
                    ? `**${orderData.presetName}** (€${orderData.basePrice} + €${orderData.monthlyPrice}/mo)`
                    : orderData.isIntegration
                        ? `**${orderData.botType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ↔ ')}** (${orderData.selectedTier}) - €${orderData.basePrice}`
                        : orderData.botType.charAt(0).toUpperCase() + orderData.botType.slice(1) + ` (€${orderData.basePrice})`,
                inline: true
            },
            {
                name: '💰 Total Price',
                value: orderData.isPreset 
                    ? `€${total} setup + €${orderData.monthlyPrice}/mo`
                    : `€${total}`,
                inline: true
            },
            {
                name: '⚡ Features',
                value: orderData.features.length > 0 
                    ? orderData.features.map(f => `• ${f.name} (+€${f.price})`).join('\n')
                    : 'None selected',
                inline: false
            },
            {
                name: '🎁 Add-ons',
                value: orderData.addons.length > 0
                    ? orderData.addons.map(a => {
                        let name = a.name;
                        if (a.name === 'api' && a.apiType) {
                            name = a.apiType;
                        }
                        return `• ${name} (+€${a.price})`;
                    }).join('\n')
                    : 'None selected',
                inline: false
            }
        ],
        timestamp: new Date().toISOString(),
        footer: {
            text: 'BotMaker Configuration Studio • dx_nzaaa will contact you'
        }
    };
    
    // Add special requests if any
    if (orderData.specialRequests) {
        embed.fields.push({
            name: '📝 Special Requests',
            value: orderData.specialRequests.substring(0, 1000),
            inline: false
        });
    }
    
    // Send to Discord
    try {
        if (DISCORD_WEBHOOK_URL !== 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
            await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: 'BotMaker Orders',
                    avatar_url: 'https://i.imgur.com/AfFp7pu.png',
                    embeds: [embed]
                })
            });
        }
        
        // Show success
        showSuccess();
        
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error submitting your order. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Submit Order';
    }
});

function showSuccess() {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    overlay.innerHTML = `
        <div class="success-content">
            <div class="success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
            </div>
            <h2>Order Submitted!</h2>
            <p>We've received your order. <strong>dx_nzaaa</strong> will contact you on Discord soon!</p>
            <a href="index.html">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Home
            </a>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Initialize
updateSteps();
updatePriceCalculator();
