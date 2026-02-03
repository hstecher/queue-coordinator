/**
 * Gemini Telescope Operations Simulator
 * An educational tool for teaching telescope operations to students
 */

// ===================================
// CONFIGURATION
// ===================================
const CONFIG = {
    // Simulation timing (in real seconds)
    OBSERVATION_DURATION_SCALE: 0.1, // 1 minute of observation = 6 real seconds
    SLEW_DURATION: 3000, // 3 seconds to slew
    TIME_SPEED: 60, // 1 real second = 1 simulated minute
    
    // Star field
    NUM_STARS: 200,
    SIDEREAL_RATE: 0.5, // pixels per second drift
    
    // Weather
    WEATHER_CHANGE_INTERVAL: 5000, // Weather can change every 5 seconds
    
    // IQ requirements (seeing in arcseconds)
    IQ_REQUIREMENTS: {
        'IQ20': 0.4,  // Excellent seeing required
        'IQ70': 0.7,  // Good seeing required
        'IQ85': 1.0,  // Moderate seeing ok
        'IQAny': 2.0  // Any conditions
    },
    
    // Points multipliers
    BASE_POINTS: {
        'IQ20': 100,
        'IQ70': 70,
        'IQ85': 50,
        'IQAny': 30
    }
};

// ===================================
// OBSERVATION CATALOG
// ===================================
const OBSERVATION_CATALOG = [
    {
        id: 1,
        name: "M42 - Orion Nebula",
        type: "nebula",
        icon: "🌌",
        ra: "05:35:17",
        dec: "-05°23'28\"",
        iq: "IQ85",
        duration: 5, // minutes
        description: "Star-forming region in Orion"
    },
    {
        id: 2,
        name: "NGC 1365 - Barred Spiral",
        type: "galaxy",
        icon: "🌀",
        ra: "03:33:36",
        dec: "-36°08'25\"",
        iq: "IQ70",
        duration: 8,
        description: "Barred spiral galaxy in Fornax"
    },
    {
        id: 3,
        name: "Proxima Centauri",
        type: "star",
        icon: "⭐",
        ra: "14:29:43",
        dec: "-62°40'46\"",
        iq: "IQ20",
        duration: 10,
        description: "Closest star to the Sun"
    },
    {
        id: 4,
        name: "67P/Churyumov–Gerasimenko",
        type: "comet",
        icon: "☄️",
        ra: "22:15:44",
        dec: "+12°18'32\"",
        iq: "IQAny",
        duration: 4,
        description: "Periodic comet, non-sidereal tracking",
        nonSidereal: true
    },
    {
        id: 5,
        name: "M31 - Andromeda Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "00:42:44",
        dec: "+41°16'09\"",
        iq: "IQ85",
        duration: 6,
        description: "Nearest large galaxy"
    },
    {
        id: 6,
        name: "Betelgeuse",
        type: "star",
        icon: "⭐",
        ra: "05:55:10",
        dec: "+07°24'25\"",
        iq: "IQAny",
        duration: 3,
        description: "Red supergiant in Orion"
    },
    {
        id: 7,
        name: "GJ 1214 b Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "17:15:19",
        dec: "+04°57'50\"",
        iq: "IQ20",
        duration: 15,
        description: "Exoplanet transit observation"
    },
    {
        id: 8,
        name: "NGC 6397 - Globular Cluster",
        type: "cluster",
        icon: "✨",
        ra: "17:40:42",
        dec: "-53°40'27\"",
        iq: "IQ70",
        duration: 7,
        description: "One of the closest globular clusters"
    },
    {
        id: 9,
        name: "Crab Nebula - M1",
        type: "nebula",
        icon: "🌌",
        ra: "05:34:32",
        dec: "+22°00'52\"",
        iq: "IQ85",
        duration: 5,
        description: "Supernova remnant in Taurus"
    },
    {
        id: 10,
        name: "2024 PT5 - Near Earth Asteroid",
        type: "asteroid",
        icon: "🪨",
        ra: "18:45:12",
        dec: "-23°12'45\"",
        iq: "IQAny",
        duration: 4,
        description: "Fast-moving NEO, non-sidereal",
        nonSidereal: true
    },
    {
        id: 11,
        name: "Vega - Standard Star",
        type: "star",
        icon: "⭐",
        ra: "18:36:56",
        dec: "+38°47'01\"",
        iq: "IQAny",
        duration: 2,
        description: "Photometric standard star"
    },
    {
        id: 12,
        name: "NGC 253 - Sculptor Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "00:47:33",
        dec: "-25°17'18\"",
        iq: "IQ70",
        duration: 9,
        description: "Starburst galaxy in Sculptor"
    },
    {
        id: 13,
        name: "TRAPPIST-1 System",
        type: "exoplanet",
        icon: "🪐",
        ra: "23:06:29",
        dec: "-05°02'29\"",
        iq: "IQ20",
        duration: 12,
        description: "Multi-planet system observation"
    },
    {
        id: 14,
        name: "Omega Centauri",
        type: "cluster",
        icon: "✨",
        ra: "13:26:47",
        dec: "-47°28'46\"",
        iq: "IQ85",
        duration: 6,
        description: "Largest globular cluster in MW"
    },
    {
        id: 15,
        name: "C/2023 A3 Tsuchinshan-ATLAS",
        type: "comet",
        icon: "☄️",
        ra: "16:22:18",
        dec: "-28°45'10\"",
        iq: "IQAny",
        duration: 5,
        description: "Bright periodic comet",
        nonSidereal: true
    },
    {
        id: 16,
        name: "Eta Carinae",
        type: "star",
        icon: "⭐",
        ra: "10:45:04",
        dec: "-59°41'04\"",
        iq: "IQ70",
        duration: 8,
        description: "Massive binary star system"
    }
];

// ===================================
// APPLICATION STATE
// ===================================
let state = {
    // Simulation
    isRunning: false,
    currentObsIndex: -1,
    observationProgress: 0,
    totalScore: 0,
    completedObs: [],
    
    // Time
    simTime: new Date(2024, 0, 15, 19, 0, 0), // Start at 7 PM
    
    // Camera
    stars: [],
    currentRA: 0,
    currentDec: 0,
    targetRA: 0,
    targetDec: 0,
    isSlewing: false,
    slewProgress: 0,
    
    // Weather
    weather: {
        clouds: 20,
        seeing: 0.8,
        humidity: 45
    },
    forecast: [],
    
    // Queue
    nightlyQueue: [],
    
    // Animation
    lastFrameTime: 0,
    animationId: null
};

// ===================================
// DOM ELEMENTS
// ===================================
let elements = {};

function initElements() {
    elements = {
        // Canvas
        canvas: document.getElementById('acquisitionCamera'),
        ctx: null,
        
        // Time & Score
        simTime: document.getElementById('simTime'),
        totalScore: document.getElementById('totalScore'),
        
        // Camera
        cameraStatus: document.getElementById('cameraStatus'),
        currentRA: document.getElementById('currentRA'),
        currentDec: document.getElementById('currentDec'),
        currentTargetInfo: document.getElementById('currentTargetInfo'),
        observationProgress: document.getElementById('observationProgress'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        
        // Weather
        cloudBar: document.getElementById('cloudBar'),
        cloudValue: document.getElementById('cloudValue'),
        seeingBar: document.getElementById('seeingBar'),
        seeingValue: document.getElementById('seeingValue'),
        humidityBar: document.getElementById('humidityBar'),
        humidityValue: document.getElementById('humidityValue'),
        forecastTimeline: document.getElementById('forecastTimeline'),
        
        // Status
        statusTarget: document.getElementById('statusTarget'),
        obsComplete: document.getElementById('obsComplete'),
        queueStatus: document.getElementById('queueStatus'),
        lastScore: document.getElementById('lastScore'),
        
        // Queue
        observationCatalog: document.getElementById('observationCatalog'),
        nightlyQueue: document.getElementById('nightlyQueue'),
        queueCount: document.getElementById('queueCount'),
        startNightBtn: document.getElementById('startNightBtn'),
        resetBtn: document.getElementById('resetBtn'),
        
        // Modal
        resultsModal: document.getElementById('resultsModal'),
        finalScore: document.getElementById('finalScore'),
        obsCompleted: document.getElementById('obsCompleted'),
        avgScore: document.getElementById('avgScore'),
        observationResults: document.getElementById('observationResults'),
        closeModalBtn: document.getElementById('closeModalBtn')
    };
    
    elements.ctx = elements.canvas.getContext('2d');
}

// ===================================
// INITIALIZATION
// ===================================
function init() {
    initElements();
    resizeCanvas();
    generateStars();
    generateForecast();
    renderCatalog();
    renderQueue();
    updateWeatherDisplay();
    setupEventListeners();
    startRenderLoop();
}

function resizeCanvas() {
    const container = elements.canvas.parentElement;
    elements.canvas.width = container.clientWidth;
    elements.canvas.height = container.clientHeight;
}

function generateStars() {
    state.stars = [];
    for (let i = 0; i < CONFIG.NUM_STARS; i++) {
        state.stars.push({
            x: Math.random() * elements.canvas.width,
            y: Math.random() * elements.canvas.height,
            brightness: Math.random() * 0.7 + 0.3,
            size: Math.random() * 2 + 0.5,
            twinkleOffset: Math.random() * Math.PI * 2
        });
    }
}

function generateForecast() {
    state.forecast = [];
    const conditions = ['clear', 'clear', 'partly-cloudy', 'cloudy'];
    
    for (let hour = 19; hour <= 24 + 5; hour++) { // 7 PM to 5 AM
        const displayHour = hour > 24 ? hour - 24 : hour;
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        let clouds, seeing;
        switch (condition) {
            case 'clear':
                clouds = Math.random() * 20;
                seeing = 0.4 + Math.random() * 0.4;
                break;
            case 'partly-cloudy':
                clouds = 30 + Math.random() * 30;
                seeing = 0.7 + Math.random() * 0.5;
                break;
            case 'cloudy':
                clouds = 60 + Math.random() * 40;
                seeing = 1.2 + Math.random() * 0.8;
                break;
        }
        
        state.forecast.push({
            hour: displayHour,
            condition,
            clouds,
            seeing,
            icon: condition === 'clear' ? '🌙' : condition === 'partly-cloudy' ? '⛅' : '☁️'
        });
    }
    
    renderForecast();
    
    // Set initial weather based on first forecast block
    if (state.forecast.length > 0) {
        state.weather.clouds = state.forecast[0].clouds;
        state.weather.seeing = state.forecast[0].seeing;
    }
}

function renderForecast() {
    elements.forecastTimeline.innerHTML = state.forecast.map((block, i) => `
        <div class="forecast-block ${block.condition}" title="Clouds: ${Math.round(block.clouds)}%, Seeing: ${block.seeing.toFixed(2)}&quot;">
            <span class="icon">${block.icon}</span>
            <span class="time">${block.hour}:00</span>
        </div>
    `).join('');
}

// ===================================
// EVENT LISTENERS
// ===================================
function setupEventListeners() {
    window.addEventListener('resize', () => {
        resizeCanvas();
        generateStars();
    });
    
    elements.startNightBtn.addEventListener('click', startNight);
    elements.resetBtn.addEventListener('click', resetSimulation);
    elements.closeModalBtn.addEventListener('click', closeModal);
}

// ===================================
// CATALOG & QUEUE MANAGEMENT
// ===================================
function renderCatalog() {
    elements.observationCatalog.innerHTML = OBSERVATION_CATALOG.map(obs => {
        const inQueue = state.nightlyQueue.some(q => q.id === obs.id);
        const points = CONFIG.BASE_POINTS[obs.iq];
        
        return `
            <div class="observation-item ${inQueue ? 'in-queue' : ''}" data-id="${obs.id}">
                <span class="obs-icon">${obs.icon}</span>
                <div class="obs-info">
                    <div class="obs-name">${obs.name}</div>
                    <div class="obs-details">
                        <span class="obs-iq ${obs.iq.toLowerCase()}">${obs.iq}</span>
                        <span class="obs-points">+${points} pts</span>
                        <span class="obs-duration">${obs.duration} min</span>
                    </div>
                </div>
                <button class="obs-action" onclick="addToQueue(${obs.id})" ${inQueue || state.isRunning ? 'disabled' : ''}>+</button>
            </div>
        `;
    }).join('');
}

function renderQueue() {
    if (state.nightlyQueue.length === 0) {
        elements.nightlyQueue.innerHTML = `
            <div class="empty-queue">
                <span>🌙</span>
                <p>Add observations from the catalog to build your nightly queue</p>
            </div>
        `;
    } else {
        elements.nightlyQueue.innerHTML = state.nightlyQueue.map((obs, index) => {
            const points = CONFIG.BASE_POINTS[obs.iq];
            const isCurrent = state.isRunning && index === state.currentObsIndex;
            const isCompleted = state.completedObs.some(c => c.id === obs.id);
            
            return `
                <div class="observation-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}" data-id="${obs.id}">
                    <span class="obs-icon">${obs.icon}</span>
                    <div class="obs-info">
                        <div class="obs-name">${index + 1}. ${obs.name}</div>
                        <div class="obs-details">
                            <span class="obs-iq ${obs.iq.toLowerCase()}">${obs.iq}</span>
                            <span class="obs-points">+${points} pts</span>
                            <span class="obs-duration">${obs.duration} min</span>
                        </div>
                    </div>
                    ${!state.isRunning && !isCompleted ? 
                        `<button class="obs-action remove" onclick="removeFromQueue(${obs.id})">×</button>` : 
                        isCompleted ? '<span style="color: var(--accent-success);">✓</span>' : 
                        isCurrent ? '<span style="color: var(--accent-primary);">▶</span>' : ''
                    }
                </div>
            `;
        }).join('');
    }
    
    elements.queueCount.textContent = `${state.nightlyQueue.length} observations`;
    elements.startNightBtn.disabled = state.nightlyQueue.length === 0 || state.isRunning;
    updateStatusDisplay();
}

function addToQueue(obsId) {
    const obs = OBSERVATION_CATALOG.find(o => o.id === obsId);
    if (obs && !state.nightlyQueue.some(q => q.id === obsId)) {
        state.nightlyQueue.push({...obs});
        renderCatalog();
        renderQueue();
    }
}

function removeFromQueue(obsId) {
    state.nightlyQueue = state.nightlyQueue.filter(o => o.id !== obsId);
    renderCatalog();
    renderQueue();
}

// Make functions globally accessible
window.addToQueue = addToQueue;
window.removeFromQueue = removeFromQueue;

// ===================================
// SIMULATION CONTROL
// ===================================
function startNight() {
    if (state.nightlyQueue.length === 0) return;
    
    state.isRunning = true;
    state.currentObsIndex = -1;
    state.completedObs = [];
    state.totalScore = 0;
    
    elements.startNightBtn.disabled = true;
    elements.queueStatus.textContent = 'Running';
    elements.queueStatus.className = 'status-value status-badge running';
    
    renderCatalog();
    startNextObservation();
}

function startNextObservation() {
    state.currentObsIndex++;
    
    if (state.currentObsIndex >= state.nightlyQueue.length) {
        endNight();
        return;
    }
    
    const obs = state.nightlyQueue[state.currentObsIndex];
    
    // Parse RA/Dec for display
    state.targetRA = parseRA(obs.ra);
    state.targetDec = parseDec(obs.dec);
    
    // Start slewing
    state.isSlewing = true;
    state.slewProgress = 0;
    
    elements.cameraStatus.textContent = 'SLEWING';
    elements.cameraStatus.className = 'status-badge slewing';
    elements.statusTarget.textContent = obs.name;
    
    renderQueue();
    
    // After slew, start observing
    setTimeout(() => {
        state.isSlewing = false;
        state.currentRA = state.targetRA;
        state.currentDec = state.targetDec;
        startObserving(obs);
    }, CONFIG.SLEW_DURATION);
}

function startObserving(obs) {
    elements.cameraStatus.textContent = 'OBSERVING';
    elements.cameraStatus.className = 'status-badge observing';
    
    elements.currentTargetInfo.innerHTML = `
        <span class="obs-icon">${obs.icon}</span>
        <span><strong>${obs.name}</strong></span>
        <span class="obs-iq ${obs.iq.toLowerCase()}">${obs.iq}</span>
    `;
    
    elements.observationProgress.classList.remove('hidden');
    state.observationProgress = 0;
    
    // Calculate observation duration in real time
    const realDuration = obs.duration * 60 * 1000 * CONFIG.OBSERVATION_DURATION_SCALE;
    const startTime = Date.now();
    
    const updateProgress = () => {
        if (!state.isRunning) return;
        
        const elapsed = Date.now() - startTime;
        state.observationProgress = Math.min(elapsed / realDuration, 1);
        
        elements.progressFill.style.width = `${state.observationProgress * 100}%`;
        
        const elapsedMins = Math.floor((elapsed / realDuration) * obs.duration);
        const elapsedSecs = Math.floor(((elapsed / realDuration) * obs.duration * 60) % 60);
        elements.progressText.textContent = `${elapsedMins}:${String(elapsedSecs).padStart(2, '0')} / ${obs.duration}:00`;
        
        // Update weather during observation
        updateWeatherFromForecast();
        
        if (state.observationProgress >= 1) {
            completeObservation(obs);
        } else {
            requestAnimationFrame(updateProgress);
        }
    };
    
    requestAnimationFrame(updateProgress);
}

function completeObservation(obs) {
    // Calculate score based on weather and IQ
    const score = calculateScore(obs);
    
    state.completedObs.push({
        ...obs,
        score: score.points,
        efficiency: score.efficiency
    });
    
    state.totalScore += score.points;
    elements.totalScore.textContent = state.totalScore;
    
    // Show last score
    const lastScoreEl = elements.lastScore;
    lastScoreEl.classList.remove('hidden');
    lastScoreEl.querySelector('.score-value').textContent = `+${score.points}`;
    
    // Update status
    elements.obsComplete.textContent = `${state.completedObs.length} / ${state.nightlyQueue.length}`;
    
    // Advance simulation time
    state.simTime.setMinutes(state.simTime.getMinutes() + obs.duration);
    
    elements.observationProgress.classList.add('hidden');
    elements.currentTargetInfo.innerHTML = '<span class="no-target">Moving to next target...</span>';
    
    renderQueue();
    
    // Short delay before next observation
    setTimeout(() => {
        startNextObservation();
    }, 1000);
}

function calculateScore(obs) {
    const requiredSeeing = CONFIG.IQ_REQUIREMENTS[obs.iq];
    const actualSeeing = state.weather.seeing;
    const basePoints = CONFIG.BASE_POINTS[obs.iq];
    
    let multiplier;
    
    if (actualSeeing <= requiredSeeing) {
        // Good or excellent conditions
        const bonus = (requiredSeeing - actualSeeing) / requiredSeeing;
        multiplier = 1.0 + (bonus * 0.5); // Up to 50% bonus
    } else {
        // Poor conditions
        const penalty = (actualSeeing - requiredSeeing) / requiredSeeing;
        multiplier = Math.max(0.2, 1.0 - (penalty * 0.8)); // Minimum 20%
    }
    
    // Cloud penalty
    if (state.weather.clouds > 50) {
        multiplier *= 0.5;
    } else if (state.weather.clouds > 30) {
        multiplier *= 0.75;
    }
    
    const points = Math.round(basePoints * multiplier);
    const efficiency = Math.round(multiplier * 100);
    
    return { points, efficiency, multiplier };
}

function endNight() {
    state.isRunning = false;
    
    elements.cameraStatus.textContent = 'COMPLETE';
    elements.cameraStatus.className = 'status-badge active';
    elements.queueStatus.textContent = 'Complete';
    elements.queueStatus.className = 'status-value status-badge active';
    
    showResults();
}

function showResults() {
    const totalPossible = state.completedObs.reduce((sum, obs) => sum + CONFIG.BASE_POINTS[obs.iq], 0);
    const avgEfficiency = totalPossible > 0 ? Math.round((state.totalScore / totalPossible) * 100) : 0;
    
    elements.finalScore.textContent = state.totalScore;
    elements.obsCompleted.textContent = state.completedObs.length;
    elements.avgScore.textContent = `${avgEfficiency}%`;
    
    elements.observationResults.innerHTML = state.completedObs.map(obs => {
        const maxPoints = CONFIG.BASE_POINTS[obs.iq];
        const scoreClass = obs.efficiency >= 80 ? 'good' : obs.efficiency >= 50 ? 'ok' : 'poor';
        
        return `
            <div class="obs-result">
                <span class="obs-result-name">${obs.icon} ${obs.name}</span>
                <span class="obs-result-score ${scoreClass}">+${obs.score} / ${maxPoints}</span>
            </div>
        `;
    }).join('');
    
    elements.resultsModal.classList.remove('hidden');
}

function closeModal() {
    elements.resultsModal.classList.add('hidden');
    resetSimulation();
}

function resetSimulation() {
    state.isRunning = false;
    state.currentObsIndex = -1;
    state.observationProgress = 0;
    state.totalScore = 0;
    state.completedObs = [];
    state.nightlyQueue = [];
    state.simTime = new Date(2024, 0, 15, 19, 0, 0);
    state.isSlewing = false;
    
    elements.cameraStatus.textContent = 'IDLE';
    elements.cameraStatus.className = 'status-badge';
    elements.queueStatus.textContent = 'Waiting';
    elements.queueStatus.className = 'status-value status-badge idle';
    elements.totalScore.textContent = '0';
    elements.obsComplete.textContent = '0 / 0';
    elements.currentTargetInfo.innerHTML = '<span class="no-target">No target selected</span>';
    elements.observationProgress.classList.add('hidden');
    elements.lastScore.classList.add('hidden');
    
    generateForecast();
    renderCatalog();
    renderQueue();
    updateWeatherDisplay();
}

// ===================================
// WEATHER SYSTEM
// ===================================
function updateWeatherFromForecast() {
    const currentHour = state.simTime.getHours();
    const forecastBlock = state.forecast.find(f => f.hour === currentHour) || state.forecast[0];
    
    if (forecastBlock) {
        // Smooth transition to forecast values
        state.weather.clouds += (forecastBlock.clouds - state.weather.clouds) * 0.1;
        state.weather.seeing += (forecastBlock.seeing - state.weather.seeing) * 0.1;
        state.weather.humidity = 40 + Math.random() * 30;
        
        updateWeatherDisplay();
    }
}

function updateWeatherDisplay() {
    elements.cloudBar.style.width = `${state.weather.clouds}%`;
    elements.cloudValue.textContent = `${Math.round(state.weather.clouds)}%`;
    
    // Seeing: 0.2" (best) to 2.0" (worst) mapped to 0-100%
    const seeingPercent = ((state.weather.seeing - 0.2) / 1.8) * 100;
    elements.seeingBar.style.width = `${Math.min(100, Math.max(0, seeingPercent))}%`;
    elements.seeingValue.textContent = `${state.weather.seeing.toFixed(2)}"`;
    
    elements.humidityBar.style.width = `${state.weather.humidity}%`;
    elements.humidityValue.textContent = `${Math.round(state.weather.humidity)}%`;
}

function updateStatusDisplay() {
    elements.obsComplete.textContent = `${state.completedObs.length} / ${state.nightlyQueue.length}`;
}

// ===================================
// RENDERING
// ===================================
function startRenderLoop() {
    function render(timestamp) {
        const deltaTime = timestamp - state.lastFrameTime;
        state.lastFrameTime = timestamp;
        
        // Clear canvas
        const ctx = elements.ctx;
        const canvas = elements.canvas;
        
        // Draw sky background with gradient
        const skyGradient = ctx.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width
        );
        skyGradient.addColorStop(0, '#0a0a15');
        skyGradient.addColorStop(1, '#000005');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw and update stars
        renderStars(ctx, canvas, deltaTime);
        
        // Draw weather effects
        renderWeatherEffects(ctx, canvas);
        
        // Draw current target if observing
        if (state.isRunning && !state.isSlewing && state.currentObsIndex >= 0) {
            renderTarget(ctx, canvas);
        }
        
        // Draw slewing effect
        if (state.isSlewing) {
            renderSlewingEffect(ctx, canvas, deltaTime);
        }
        
        // Update time display
        updateTimeDisplay();
        
        // Update coordinates display
        updateCoordsDisplay();
        
        state.animationId = requestAnimationFrame(render);
    }
    
    state.animationId = requestAnimationFrame(render);
}

function renderStars(ctx, canvas, deltaTime) {
    const siderealDrift = state.isSlewing ? CONFIG.SIDEREAL_RATE * 10 : CONFIG.SIDEREAL_RATE;
    const time = Date.now() / 1000;
    
    state.stars.forEach(star => {
        // Sidereal motion
        star.x -= siderealDrift * (deltaTime / 1000) * 60;
        
        // Wrap around
        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
        
        // Calculate visibility based on clouds
        const cloudFactor = 1 - (state.weather.clouds / 100) * 0.9;
        
        // Calculate twinkle
        const twinkle = 0.7 + 0.3 * Math.sin(time * 3 + star.twinkleOffset);
        
        // Seeing affects star size (blur)
        const blurFactor = 1 + (state.weather.seeing - 0.4) * 1.5;
        
        const alpha = star.brightness * cloudFactor * twinkle;
        const size = star.size * blurFactor;
        
        if (alpha > 0.1) {
            // Draw star with glow
            const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
            gradient.addColorStop(0.3, `rgba(200, 220, 255, ${alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    });
}

function renderWeatherEffects(ctx, canvas) {
    // Cloud overlay
    if (state.weather.clouds > 10) {
        const cloudAlpha = (state.weather.clouds / 100) * 0.6;
        
        // Create cloud pattern
        ctx.fillStyle = `rgba(80, 80, 90, ${cloudAlpha})`;
        
        const time = Date.now() / 5000;
        const numClouds = Math.floor(state.weather.clouds / 10);
        
        for (let i = 0; i < numClouds; i++) {
            const x = ((i * 137 + time * 50) % (canvas.width + 200)) - 100;
            const y = (Math.sin(i * 0.5) * 0.3 + 0.5) * canvas.height;
            const size = 100 + (i % 5) * 30;
            
            ctx.beginPath();
            ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Seeing haze
    if (state.weather.seeing > 0.8) {
        const hazeAlpha = (state.weather.seeing - 0.8) * 0.15;
        ctx.fillStyle = `rgba(100, 100, 120, ${hazeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function renderTarget(ctx, canvas) {
    const obs = state.nightlyQueue[state.currentObsIndex];
    if (!obs) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Different renderings based on target type
    switch (obs.type) {
        case 'galaxy':
            renderGalaxy(ctx, centerX, centerY);
            break;
        case 'nebula':
            renderNebula(ctx, centerX, centerY);
            break;
        case 'star':
        case 'exoplanet':
            renderBrightStar(ctx, centerX, centerY);
            break;
        case 'cluster':
            renderCluster(ctx, centerX, centerY);
            break;
        case 'comet':
            renderComet(ctx, centerX, centerY);
            break;
        case 'asteroid':
            renderAsteroid(ctx, centerX, centerY);
            break;
        default:
            renderBrightStar(ctx, centerX, centerY);
    }
}

function renderGalaxy(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    const time = Date.now() / 1000;
    
    // Spiral galaxy
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(0.5);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    gradient.addColorStop(0, `rgba(255, 240, 200, ${0.9 * cloudFactor})`);
    gradient.addColorStop(0.3, `rgba(200, 180, 150, ${0.5 * cloudFactor})`);
    gradient.addColorStop(0.7, `rgba(100, 80, 120, ${0.3 * cloudFactor})`);
    gradient.addColorStop(1, 'rgba(50, 40, 80, 0)');
    
    ctx.beginPath();
    ctx.ellipse(0, 0, 80, 40, 0, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.restore();
}

function renderNebula(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    
    // Colorful nebula
    const colors = [
        { r: 255, g: 100, b: 150 },
        { r: 100, g: 150, b: 255 },
        { r: 150, g: 255, b: 200 }
    ];
    
    colors.forEach((color, i) => {
        const gradient = ctx.createRadialGradient(
            x + (i - 1) * 20, y + (i - 1) * 15, 0,
            x + (i - 1) * 20, y + (i - 1) * 15, 70
        );
        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.4 * cloudFactor})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.2 * cloudFactor})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.beginPath();
        ctx.arc(x + (i - 1) * 20, y + (i - 1) * 15, 70, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

function renderBrightStar(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    const blurFactor = 1 + (state.weather.seeing - 0.4);
    
    // Bright central star
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30 * blurFactor);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${cloudFactor})`);
    gradient.addColorStop(0.2, `rgba(200, 220, 255, ${0.8 * cloudFactor})`);
    gradient.addColorStop(0.5, `rgba(100, 150, 255, ${0.3 * cloudFactor})`);
    gradient.addColorStop(1, 'rgba(50, 80, 150, 0)');
    
    ctx.beginPath();
    ctx.arc(x, y, 30 * blurFactor, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Diffraction spikes
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 * cloudFactor})`;
    ctx.lineWidth = 1;
    
    for (let angle = 0; angle < Math.PI; angle += Math.PI / 2) {
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 5, y + Math.sin(angle) * 5);
        ctx.lineTo(x + Math.cos(angle) * 40, y + Math.sin(angle) * 40);
        ctx.moveTo(x - Math.cos(angle) * 5, y - Math.sin(angle) * 5);
        ctx.lineTo(x - Math.cos(angle) * 40, y - Math.sin(angle) * 40);
        ctx.stroke();
    }
}

function renderCluster(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    
    // Multiple stars in cluster
    for (let i = 0; i < 30; i++) {
        const angle = (i / 30) * Math.PI * 2 + i * 0.5;
        const dist = 10 + Math.random() * 50;
        const sx = x + Math.cos(angle) * dist;
        const sy = y + Math.sin(angle) * dist;
        const size = 1 + Math.random() * 2;
        
        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size * 3);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${cloudFactor})`);
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(sx, sy, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

function renderComet(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    const time = Date.now() / 1000;
    
    // Non-sidereal - comet moves slightly
    const offsetX = Math.sin(time * 0.5) * 5;
    const offsetY = Math.cos(time * 0.3) * 3;
    
    // Comet nucleus
    const gradient = ctx.createRadialGradient(x + offsetX, y + offsetY, 0, x + offsetX, y + offsetY, 15);
    gradient.addColorStop(0, `rgba(255, 255, 200, ${cloudFactor})`);
    gradient.addColorStop(0.5, `rgba(200, 200, 150, ${0.5 * cloudFactor})`);
    gradient.addColorStop(1, 'rgba(100, 100, 80, 0)');
    
    ctx.beginPath();
    ctx.arc(x + offsetX, y + offsetY, 15, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Tail
    const tailGradient = ctx.createLinearGradient(x + offsetX, y + offsetY, x + offsetX + 100, y + offsetY - 30);
    tailGradient.addColorStop(0, `rgba(150, 200, 255, ${0.4 * cloudFactor})`);
    tailGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
    
    ctx.beginPath();
    ctx.moveTo(x + offsetX, y + offsetY);
    ctx.lineTo(x + offsetX + 100, y + offsetY - 40);
    ctx.lineTo(x + offsetX + 80, y + offsetY + 10);
    ctx.closePath();
    ctx.fillStyle = tailGradient;
    ctx.fill();
}

function renderAsteroid(ctx, x, y) {
    const cloudFactor = 1 - (state.weather.clouds / 100) * 0.8;
    const time = Date.now() / 1000;
    
    // Non-sidereal - asteroid moves
    const offsetX = Math.sin(time * 2) * 10;
    const offsetY = Math.cos(time * 1.5) * 8;
    
    // Small point
    const gradient = ctx.createRadialGradient(x + offsetX, y + offsetY, 0, x + offsetX, y + offsetY, 8);
    gradient.addColorStop(0, `rgba(200, 180, 150, ${cloudFactor})`);
    gradient.addColorStop(0.5, `rgba(150, 130, 100, ${0.5 * cloudFactor})`);
    gradient.addColorStop(1, 'rgba(100, 80, 60, 0)');
    
    ctx.beginPath();
    ctx.arc(x + offsetX, y + offsetY, 8, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

function renderSlewingEffect(ctx, canvas, deltaTime) {
    state.slewProgress += deltaTime / CONFIG.SLEW_DURATION;
    
    // Motion blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Streak lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < 20; i++) {
        const y = (canvas.height / 20) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y + 10);
        ctx.stroke();
    }
}

function updateTimeDisplay() {
    if (state.isRunning) {
        state.simTime.setSeconds(state.simTime.getSeconds() + 1);
    }
    
    const hours = String(state.simTime.getHours()).padStart(2, '0');
    const mins = String(state.simTime.getMinutes()).padStart(2, '0');
    const secs = String(state.simTime.getSeconds()).padStart(2, '0');
    elements.simTime.textContent = `${hours}:${mins}:${secs}`;
}

function updateCoordsDisplay() {
    elements.currentRA.textContent = formatRA(state.currentRA);
    elements.currentDec.textContent = formatDec(state.currentDec);
}

// ===================================
// UTILITY FUNCTIONS
// ===================================
function parseRA(raString) {
    const parts = raString.split(':').map(Number);
    return parts[0] + parts[1] / 60 + parts[2] / 3600;
}

function parseDec(decString) {
    const match = decString.match(/([+-]?\d+)°(\d+)'(\d+)"/);
    if (match) {
        const sign = match[1].startsWith('-') ? -1 : 1;
        return sign * (Math.abs(parseInt(match[1])) + parseInt(match[2]) / 60 + parseInt(match[3]) / 3600);
    }
    return 0;
}

function formatRA(ra) {
    const hours = Math.floor(ra);
    const mins = Math.floor((ra - hours) * 60);
    const secs = Math.floor(((ra - hours) * 60 - mins) * 60);
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatDec(dec) {
    const sign = dec >= 0 ? '+' : '-';
    const absDec = Math.abs(dec);
    const degrees = Math.floor(absDec);
    const mins = Math.floor((absDec - degrees) * 60);
    const secs = Math.floor(((absDec - degrees) * 60 - mins) * 60);
    return `${sign}${String(degrees).padStart(2, '0')}°${String(mins).padStart(2, '0')}'${String(secs).padStart(2, '0')}"`;
}

// ===================================
// INITIALIZE ON DOM LOAD
// ===================================
document.addEventListener('DOMContentLoaded', init);
