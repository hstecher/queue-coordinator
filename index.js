/**
 * Gemini Telescope Operations Simulator
 * An educational tool for teaching telescope operations to students
 */

// ===================================
// CONFIGURATION
// ===================================
const CONFIG = {
    // Simulation timing (in real seconds)
    OBSERVATION_DURATION_SCALE: 0.0037, // ~27x faster than original (3x faster than before)
    SLEW_DURATION: 1000, // 1 second to slew
    TIME_SPEED: 60, // 1 real second = 1 simulated minute

    // Star field
    NUM_STARS: 200,
    SIDEREAL_RATE: 0.5, // pixels per second drift

    // Weather
    WEATHER_CHANGE_INTERVAL: 5000, // Weather can change every 5 seconds
    CLOUD_WIND_SPEED: 25, // pixels per second for cloud drift
    CLOUD_SLEW_SPEED: 150, // faster cloud movement during slew

    // Queue limits
    MAX_QUEUE_SIZE: 6, // Maximum number of observations in nightly queue

    // IQ requirements (seeing in arcseconds) - Image Quality percentiles
    IQ_REQUIREMENTS: {
        'IQ20': 0.4,  // Best 20% seeing conditions
        'IQ70': 0.7,  // Best 70% seeing conditions
        'IQ85': 1.0,  // Best 85% seeing conditions
        'IQAny': 2.0  // Any conditions
    },

    // CC requirements (cloud cover percentiles)
    CC_REQUIREMENTS: {
        'CC50': 50,   // Best 50% cloud conditions (< 50% clouds)
        'CC70': 70,   // Best 70% cloud conditions (< 70% clouds)
        'CC80': 80,   // Best 80% cloud conditions (< 80% clouds)
        'CCAny': 100  // Any conditions
    },

    // Humidity requirements
    WV_REQUIREMENTS: {
        'WV20': 30,   // Best 20% water vapor (< 30% humidity)
        'WV50': 50,   // Best 50% water vapor (< 50% humidity)
        'WV80': 70,   // Best 80% water vapor (< 70% humidity)
        'WVAny': 100  // Any conditions
    },

    // Base points for IQ - stricter requirements = more points
    IQ_POINTS: {
        'IQ20': 50,   // Strictest IQ
        'IQ70': 35,
        'IQ85': 25,
        'IQAny': 15
    },

    // Bonus points for CC - stricter requirements = more points
    CC_POINTS: {
        'CC50': 30,   // Strictest CC
        'CC70': 20,
        'CC80': 10,
        'CCAny': 5
    },

    // Bonus points for WV - stricter requirements = more points
    WV_POINTS: {
        'WV20': 20,   // Strictest WV
        'WV50': 12,
        'WV80': 6,
        'WVAny': 3
    }
};

// Calculate total base points for an observation
function getObservationPoints(obs) {
    return CONFIG.IQ_POINTS[obs.iq] + CONFIG.CC_POINTS[obs.cc] + CONFIG.WV_POINTS[obs.wv];
}

// Get IQ label from seeing value
function getIQFromSeeing(seeing) {
    if (seeing <= CONFIG.IQ_REQUIREMENTS['IQ20']) return 'IQ20';
    if (seeing <= CONFIG.IQ_REQUIREMENTS['IQ70']) return 'IQ70';
    if (seeing <= CONFIG.IQ_REQUIREMENTS['IQ85']) return 'IQ85';
    return 'IQAny';
}

// Get CC label from cloud percentage
function getCCFromClouds(clouds) {
    if (clouds <= CONFIG.CC_REQUIREMENTS['CC50']) return 'CC50';
    if (clouds <= CONFIG.CC_REQUIREMENTS['CC70']) return 'CC70';
    if (clouds <= CONFIG.CC_REQUIREMENTS['CC80']) return 'CC80';
    return 'CCAny';
}

// Get WV label from humidity percentage
function getWVFromHumidity(humidity) {
    if (humidity <= CONFIG.WV_REQUIREMENTS['WV20']) return 'WV20';
    if (humidity <= CONFIG.WV_REQUIREMENTS['WV50']) return 'WV50';
    if (humidity <= CONFIG.WV_REQUIREMENTS['WV80']) return 'WV80';
    return 'WVAny';
}

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
        cc: "CC70",
        wv: "WV80",
        duration: 5,
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
        cc: "CC50",
        wv: "WV50",
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
        cc: "CC50",
        wv: "WV20",
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
        cc: "CC80",
        wv: "WVAny",
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
        cc: "CC70",
        wv: "WV80",
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
        cc: "CCAny",
        wv: "WVAny",
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
        cc: "CC50",
        wv: "WV20",
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
        cc: "CC70",
        wv: "WV50",
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
        cc: "CC70",
        wv: "WV80",
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
        cc: "CC80",
        wv: "WVAny",
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
        cc: "CC70",
        wv: "WV50",
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
        cc: "CC50",
        wv: "WV50",
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
        cc: "CC50",
        wv: "WV20",
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
        cc: "CC70",
        wv: "WV80",
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
        cc: "CC80",
        wv: "WVAny",
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
        cc: "CC70",
        wv: "WV50",
        duration: 8,
        description: "Massive binary star system"
    },
    {
        id: 17,
        name: "M51 - Whirlpool Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "13:29:52",
        dec: "+47°11'43\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 7,
        description: "Interacting spiral galaxy pair"
    },
    {
        id: 18,
        name: "Ring Nebula - M57",
        type: "nebula",
        icon: "🌌",
        ra: "18:53:35",
        dec: "+33°01'45\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 4,
        description: "Planetary nebula in Lyra"
    },
    {
        id: 19,
        name: "Sirius A & B",
        type: "star",
        icon: "⭐",
        ra: "06:45:09",
        dec: "-16°42'58\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 6,
        description: "Binary star with white dwarf"
    },
    {
        id: 20,
        name: "M87 - Virgo A",
        type: "galaxy",
        icon: "🌀",
        ra: "12:30:49",
        dec: "+12°23'28\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 10,
        description: "Giant elliptical with black hole jet"
    },
    {
        id: 21,
        name: "Pleiades - M45",
        type: "cluster",
        icon: "✨",
        ra: "03:47:00",
        dec: "+24°07'00\"",
        iq: "IQAny",
        cc: "CCAny",
        wv: "WVAny",
        duration: 3,
        description: "Open cluster - Seven Sisters"
    },
    {
        id: 22,
        name: "Kepler-442b Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "04:53:09",
        dec: "+41°38'41\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 14,
        description: "Super-Earth in habitable zone"
    },
    {
        id: 23,
        name: "Helix Nebula - NGC 7293",
        type: "nebula",
        icon: "🌌",
        ra: "22:29:39",
        dec: "-20°50'14\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 6,
        description: "Closest planetary nebula"
    },
    {
        id: 24,
        name: "Centaurus A - NGC 5128",
        type: "galaxy",
        icon: "🌀",
        ra: "13:25:28",
        dec: "-43°01'09\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 9,
        description: "Peculiar galaxy with dust lane"
    },
    {
        id: 25,
        name: "47 Tucanae",
        type: "cluster",
        icon: "✨",
        ra: "00:24:05",
        dec: "-72°04'53\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 5,
        description: "Dense globular cluster"
    },
    {
        id: 26,
        name: "2 Pallas",
        type: "asteroid",
        icon: "🪨",
        ra: "08:12:34",
        dec: "+15°23'12\"",
        iq: "IQAny",
        cc: "CC80",
        wv: "WVAny",
        duration: 3,
        description: "Third largest asteroid",
        nonSidereal: true
    },
    {
        id: 27,
        name: "Polaris - North Star",
        type: "star",
        icon: "⭐",
        ra: "02:31:49",
        dec: "+89°15'51\"",
        iq: "IQAny",
        cc: "CCAny",
        wv: "WVAny",
        duration: 2,
        description: "Cepheid variable star"
    },
    {
        id: 28,
        name: "Sombrero Galaxy - M104",
        type: "galaxy",
        icon: "🌀",
        ra: "12:39:59",
        dec: "-11°37'23\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 8,
        description: "Edge-on spiral with dust ring"
    },
    {
        id: 29,
        name: "Eagle Nebula - M16",
        type: "nebula",
        icon: "🌌",
        ra: "18:18:48",
        dec: "-13°47'00\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 7,
        description: "Pillars of Creation location"
    },
    {
        id: 30,
        name: "WASP-121b Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "07:10:24",
        dec: "-39°05'51\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 11,
        description: "Hot Jupiter with metal vapors"
    },
    {
        id: 31,
        name: "Lagoon Nebula - M8",
        type: "nebula",
        icon: "🌌",
        ra: "18:03:37",
        dec: "-24°23'12\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 5,
        description: "Giant interstellar cloud"
    },
    {
        id: 32,
        name: "Triangulum Galaxy - M33",
        type: "galaxy",
        icon: "🌀",
        ra: "01:33:51",
        dec: "+30°39'37\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 8,
        description: "Third largest in Local Group"
    },
    {
        id: 33,
        name: "Barnard's Star",
        type: "star",
        icon: "⭐",
        ra: "17:57:48",
        dec: "+04°41'36\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 7,
        description: "Fastest proper motion star"
    },
    {
        id: 34,
        name: "Comet Encke",
        type: "comet",
        icon: "☄️",
        ra: "11:22:15",
        dec: "+08°12'33\"",
        iq: "IQAny",
        cc: "CC80",
        wv: "WVAny",
        duration: 4,
        description: "Short period comet",
        nonSidereal: true
    },
    {
        id: 35,
        name: "NGC 2070 - Tarantula Nebula",
        type: "nebula",
        icon: "🌌",
        ra: "05:38:38",
        dec: "-69°05'42\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 6,
        description: "Largest H II region known"
    },
    {
        id: 36,
        name: "M81 - Bode's Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "09:55:33",
        dec: "+69°03'55\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 7,
        description: "Grand design spiral galaxy"
    },
    {
        id: 37,
        name: "Arcturus",
        type: "star",
        icon: "⭐",
        ra: "14:15:40",
        dec: "+19°10'56\"",
        iq: "IQAny",
        cc: "CCAny",
        wv: "WVAny",
        duration: 2,
        description: "Brightest star in Boötes"
    },
    {
        id: 38,
        name: "M13 - Hercules Cluster",
        type: "cluster",
        icon: "✨",
        ra: "16:41:41",
        dec: "+36°27'37\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 5,
        description: "Great globular cluster"
    },
    {
        id: 39,
        name: "TOI-700 d Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "06:28:23",
        dec: "-65°34'46\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 13,
        description: "Earth-size habitable zone planet"
    },
    {
        id: 40,
        name: "4 Vesta",
        type: "asteroid",
        icon: "🪨",
        ra: "19:22:18",
        dec: "-21°45'33\"",
        iq: "IQAny",
        cc: "CC80",
        wv: "WVAny",
        duration: 3,
        description: "Second largest asteroid",
        nonSidereal: true
    },
    {
        id: 41,
        name: "Cat's Eye Nebula - NGC 6543",
        type: "nebula",
        icon: "🌌",
        ra: "17:58:33",
        dec: "+66°37'59\"",
        iq: "IQ70",
        cc: "CC70",
        wv: "WV50",
        duration: 5,
        description: "Complex planetary nebula"
    },
    {
        id: 42,
        name: "NGC 4565 - Needle Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "12:36:21",
        dec: "+25°59'15\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 8,
        description: "Edge-on spiral galaxy"
    },
    {
        id: 43,
        name: "Rigel",
        type: "star",
        icon: "⭐",
        ra: "05:14:32",
        dec: "-08°12'06\"",
        iq: "IQAny",
        cc: "CCAny",
        wv: "WVAny",
        duration: 2,
        description: "Blue supergiant in Orion"
    },
    {
        id: 44,
        name: "M22 - Sagittarius Cluster",
        type: "cluster",
        icon: "✨",
        ra: "18:36:24",
        dec: "-23°54'17\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 4,
        description: "One of nearest globulars"
    },
    {
        id: 45,
        name: "Dumbbell Nebula - M27",
        type: "nebula",
        icon: "🌌",
        ra: "19:59:36",
        dec: "+22°43'16\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 5,
        description: "Bright planetary nebula"
    },
    {
        id: 46,
        name: "M82 - Cigar Galaxy",
        type: "galaxy",
        icon: "🌀",
        ra: "09:55:52",
        dec: "+69°40'47\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 7,
        description: "Starburst galaxy"
    },
    {
        id: 47,
        name: "Aldebaran",
        type: "star",
        icon: "⭐",
        ra: "04:35:55",
        dec: "+16°30'33\"",
        iq: "IQAny",
        cc: "CCAny",
        wv: "WVAny",
        duration: 2,
        description: "Red giant eye of Taurus"
    },
    {
        id: 48,
        name: "HD 209458 b Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "22:03:11",
        dec: "+18°53'04\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 10,
        description: "First transiting exoplanet found"
    },
    {
        id: 49,
        name: "1 Ceres",
        type: "asteroid",
        icon: "🪨",
        ra: "03:45:22",
        dec: "+18°22'11\"",
        iq: "IQAny",
        cc: "CC80",
        wv: "WVAny",
        duration: 4,
        description: "Largest asteroid / dwarf planet",
        nonSidereal: true
    },
    {
        id: 50,
        name: "Rosette Nebula - NGC 2237",
        type: "nebula",
        icon: "🌌",
        ra: "06:32:24",
        dec: "+05°03'00\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 6,
        description: "Emission nebula with cluster"
    },
    {
        id: 51,
        name: "Pinwheel Galaxy - M101",
        type: "galaxy",
        icon: "🌀",
        ra: "14:03:13",
        dec: "+54°20'56\"",
        iq: "IQ70",
        cc: "CC50",
        wv: "WV50",
        duration: 9,
        description: "Face-on spiral galaxy"
    },
    {
        id: 52,
        name: "Spica",
        type: "star",
        icon: "⭐",
        ra: "13:25:12",
        dec: "-11°09'41\"",
        iq: "IQAny",
        cc: "CC70",
        wv: "WV50",
        duration: 3,
        description: "Brightest star in Virgo"
    },
    {
        id: 53,
        name: "Double Cluster - NGC 869/884",
        type: "cluster",
        icon: "✨",
        ra: "02:20:00",
        dec: "+57°08'00\"",
        iq: "IQ85",
        cc: "CC70",
        wv: "WV80",
        duration: 4,
        description: "Twin open clusters in Perseus"
    },
    {
        id: 54,
        name: "K2-18 b Transit",
        type: "exoplanet",
        icon: "🪐",
        ra: "11:30:14",
        dec: "+07°35'18\"",
        iq: "IQ20",
        cc: "CC50",
        wv: "WV20",
        duration: 12,
        description: "Water vapor detected exoplanet"
    },
    {
        id: 55,
        name: "Comet Halley Monitor",
        type: "comet",
        icon: "☄️",
        ra: "08:15:33",
        dec: "+12°44'22\"",
        iq: "IQAny",
        cc: "CC80",
        wv: "WVAny",
        duration: 5,
        description: "Long-period monitoring",
        nonSidereal: true
    }
];

// ===================================
// APPLICATION STATE
// ===================================
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let state = {
    // Simulation
    isRunning: false,
    currentObsIndex: -1,
    observationProgress: 0,
    totalScore: 0,
    completedObs: [],       // Completed observations for current night

    // Weekly tracking
    currentDay: 0,          // 0-6 for the week
    weeklyScore: 0,         // Total score across all nights
    weeklyCompletedObs: [], // All completed observations for the week
    dailyResults: [],       // Results for each night {day, score, observations, efficiency}
    availableCatalog: [],   // Observations still available (not yet completed)
    scoreSubmitted: false,  // Whether score has been submitted for current week

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
    weeklyForecast: [],     // 7-day forecast
    currentDayForecast: [], // Current night's hourly forecast

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
        currentDayLabel: document.getElementById('currentDayLabel'),

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
        seeingIQ: document.getElementById('seeingIQ'),
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
        closeModalBtn: document.getElementById('closeModalBtn'),

        // High Scores Modal
        highScoresModal: document.getElementById('highScoresModal'),
        highScoresList: document.getElementById('highScoresList'),
        submitScoreSection: document.getElementById('submitScoreSection'),
        playerNameInput: document.getElementById('playerNameInput'),
        submitScoreBtn: document.getElementById('submitScoreBtn'),
        closeHighScoresBtn: document.getElementById('closeHighScoresBtn')
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
    initializeWeek();
    renderCatalog();
    renderQueue();
    updateWeatherDisplay();
    setupEventListeners();
    startRenderLoop();
    updateDayDisplay();
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

function initializeWeek() {
    // Reset weekly state
    state.currentDay = 0;
    state.weeklyScore = 0;
    state.weeklyCompletedObs = [];
    state.dailyResults = [];
    state.availableCatalog = [...OBSERVATION_CATALOG]; // Copy of all observations
    state.scoreSubmitted = false;

    // Generate 7-day forecast
    generateWeeklyForecast();

    // Set up current day's forecast
    setCurrentDayForecast();
}

function generateWeeklyForecast() {
    state.weeklyForecast = [];
    const conditions = ['clear', 'clear', 'partly-cloudy', 'cloudy'];

    for (let day = 0; day < 7; day++) {
        // Each day has a general tendency
        const dayTendency = Math.random();
        let dayCondition;
        if (dayTendency < 0.4) dayCondition = 'clear';
        else if (dayTendency < 0.7) dayCondition = 'partly-cloudy';
        else dayCondition = 'cloudy';

        let avgClouds, avgSeeing, avgHumidity;
        switch (dayCondition) {
            case 'clear':
                avgClouds = 10 + Math.random() * 20;
                avgSeeing = 0.3 + Math.random() * 0.4;
                avgHumidity = 25 + Math.random() * 20;
                break;
            case 'partly-cloudy':
                avgClouds = 35 + Math.random() * 25;
                avgSeeing = 0.6 + Math.random() * 0.5;
                avgHumidity = 40 + Math.random() * 25;
                break;
            case 'cloudy':
                avgClouds = 65 + Math.random() * 30;
                avgSeeing = 1.0 + Math.random() * 0.8;
                avgHumidity = 60 + Math.random() * 30;
                break;
        }

        state.weeklyForecast.push({
            day,
            dayName: DAY_NAMES[day],
            condition: dayCondition,
            avgClouds: Math.min(95, avgClouds),
            avgSeeing,
            avgHumidity: Math.min(90, avgHumidity),
            icon: dayCondition === 'clear' ? '🌙' : dayCondition === 'partly-cloudy' ? '⛅' : '☁️'
        });
    }

    renderWeeklyForecast();
}

function setCurrentDayForecast() {
    const dayForecast = state.weeklyForecast[state.currentDay];
    state.currentDayForecast = [];

    // Generate hourly forecast for the current night based on daily forecast
    for (let hour = 19; hour <= 24 + 5; hour++) {
        const displayHour = hour > 24 ? hour - 24 : hour;

        // Add some variation around the daily average
        const cloudVariation = (Math.random() - 0.5) * 20;
        const seeingVariation = (Math.random() - 0.5) * 0.3;
        const humidityVariation = (Math.random() - 0.5) * 15;

        const clouds = Math.max(0, Math.min(100, dayForecast.avgClouds + cloudVariation));
        const seeing = Math.max(0.2, dayForecast.avgSeeing + seeingVariation);
        const humidity = Math.max(10, Math.min(95, dayForecast.avgHumidity + humidityVariation));

        let condition;
        if (clouds < 25) condition = 'clear';
        else if (clouds < 55) condition = 'partly-cloudy';
        else condition = 'cloudy';

        state.currentDayForecast.push({
            hour: displayHour,
            condition,
            clouds,
            seeing,
            humidity,
            icon: condition === 'clear' ? '🌙' : condition === 'partly-cloudy' ? '⛅' : '☁️'
        });
    }

    // Set initial weather based on first forecast block
    if (state.currentDayForecast.length > 0) {
        state.weather.clouds = state.currentDayForecast[0].clouds;
        state.weather.seeing = state.currentDayForecast[0].seeing;
        state.weather.humidity = state.currentDayForecast[0].humidity;
    }
}

function renderWeeklyForecast() {
    elements.forecastTimeline.innerHTML = state.weeklyForecast.map((day, i) => {
        const isCurrentDay = i === state.currentDay;
        const isPastDay = i < state.currentDay;
        return `
            <div class="forecast-block forecast-day ${day.condition} ${isCurrentDay ? 'current-day' : ''} ${isPastDay ? 'past-day' : ''}"
                 title="CC: ${Math.round(day.avgClouds)}%, IQ: ${day.avgSeeing.toFixed(2)}&quot;, WV: ${Math.round(day.avgHumidity)}%">
                <span class="icon">${day.icon}</span>
                <span class="day-name">${day.dayName.substring(0, 3)}</span>
                ${isPastDay ? '<span class="day-done">✓</span>' : ''}
            </div>
        `;
    }).join('');
}

function updateDayDisplay() {
    const dayForecast = state.weeklyForecast[state.currentDay];
    if (elements.currentDayLabel) {
        elements.currentDayLabel.textContent = `Night ${state.currentDay + 1}/7 - ${dayForecast.dayName}`;
    }
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
    elements.closeHighScoresBtn.addEventListener('click', closeHighScoresModal);
    elements.submitScoreBtn.addEventListener('click', submitScore);
    elements.playerNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitScore();
    });
}

// ===================================
// CATALOG & QUEUE MANAGEMENT
// ===================================
function renderCatalog() {
    const queueFull = state.nightlyQueue.length >= CONFIG.MAX_QUEUE_SIZE;

    if (state.availableCatalog.length === 0) {
        elements.observationCatalog.innerHTML = `
            <div class="empty-queue">
                <span>✅</span>
                <p>All observations completed this week!</p>
            </div>
        `;
        return;
    }

    elements.observationCatalog.innerHTML = state.availableCatalog.map(obs => {
        const inQueue = state.nightlyQueue.some(q => q.id === obs.id);
        const points = getObservationPoints(obs);
        const isDisabled = inQueue || state.isRunning || (queueFull && !inQueue);

        return `
            <div class="observation-item ${inQueue ? 'in-queue' : ''} ${queueFull && !inQueue ? 'queue-full' : ''}" data-id="${obs.id}">
                <span class="obs-icon">${obs.icon}</span>
                <div class="obs-info">
                    <div class="obs-name">${obs.name}</div>
                    <div class="obs-details">
                        <span class="obs-constraint ${obs.iq.toLowerCase()}">${obs.iq}</span>
                        <span class="obs-constraint ${obs.cc.toLowerCase()}">${obs.cc}</span>
                        <span class="obs-constraint ${obs.wv.toLowerCase()}">${obs.wv}</span>
                        <span class="obs-points">+${points} pts</span>
                        <span class="obs-duration">${obs.duration}m</span>
                    </div>
                </div>
                <button class="obs-action" onclick="addToQueue(${obs.id})" ${isDisabled ? 'disabled' : ''}>+</button>
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
            const points = getObservationPoints(obs);
            const isCurrent = state.isRunning && index === state.currentObsIndex;
            const isCompleted = state.completedObs.some(c => c.id === obs.id);

            return `
                <div class="observation-item ${isCurrent ? 'current' : ''} ${isCompleted ? 'completed' : ''}" data-id="${obs.id}">
                    <span class="obs-icon">${obs.icon}</span>
                    <div class="obs-info">
                        <div class="obs-name">${index + 1}. ${obs.name}</div>
                        <div class="obs-details">
                            <span class="obs-constraint ${obs.iq.toLowerCase()}">${obs.iq}</span>
                            <span class="obs-constraint ${obs.cc.toLowerCase()}">${obs.cc}</span>
                            <span class="obs-constraint ${obs.wv.toLowerCase()}">${obs.wv}</span>
                            <span class="obs-points">+${points}</span>
                            <span class="obs-duration">${obs.duration}m</span>
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

    elements.queueCount.textContent = `${state.nightlyQueue.length} / ${CONFIG.MAX_QUEUE_SIZE} observations`;
    elements.startNightBtn.disabled = state.nightlyQueue.length === 0 || state.isRunning;
    updateStatusDisplay();
}

function addToQueue(obsId) {
    const obs = state.availableCatalog.find(o => o.id === obsId);
    if (obs && !state.nightlyQueue.some(q => q.id === obsId)) {
        if (state.nightlyQueue.length >= CONFIG.MAX_QUEUE_SIZE) {
            return; // Queue is full
        }
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
    state.totalScore = 0; // Nightly score

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
    // Display shows weekly total + current night's score
    elements.totalScore.textContent = state.weeklyScore + state.totalScore;

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
    const requiredCC = CONFIG.CC_REQUIREMENTS[obs.cc];
    const requiredWV = CONFIG.WV_REQUIREMENTS[obs.wv];
    const actualSeeing = state.weather.seeing;
    const actualClouds = state.weather.clouds;
    const actualHumidity = state.weather.humidity;
    const basePoints = getObservationPoints(obs);

    let multiplier = 1.0;

    // IQ (seeing) scoring
    if (actualSeeing <= requiredSeeing) {
        // Good or excellent conditions
        const bonus = (requiredSeeing - actualSeeing) / requiredSeeing;
        multiplier *= 1.0 + (bonus * 0.3); // Up to 30% bonus
    } else {
        // Poor conditions
        const penalty = (actualSeeing - requiredSeeing) / requiredSeeing;
        multiplier *= Math.max(0.3, 1.0 - (penalty * 0.6)); // Minimum 30%
    }

    // CC (cloud cover) scoring
    if (actualClouds <= requiredCC) {
        // Good cloud conditions
        const bonus = (requiredCC - actualClouds) / requiredCC;
        multiplier *= 1.0 + (bonus * 0.2); // Up to 20% bonus
    } else {
        // Poor cloud conditions
        const penalty = (actualClouds - requiredCC) / (100 - requiredCC + 1);
        multiplier *= Math.max(0.3, 1.0 - (penalty * 0.7)); // Minimum 30%
    }

    // WV (humidity) scoring
    if (actualHumidity <= requiredWV) {
        // Good humidity conditions
        const bonus = (requiredWV - actualHumidity) / requiredWV;
        multiplier *= 1.0 + (bonus * 0.15); // Up to 15% bonus
    } else {
        // Poor humidity conditions
        const penalty = (actualHumidity - requiredWV) / (100 - requiredWV + 1);
        multiplier *= Math.max(0.5, 1.0 - (penalty * 0.5)); // Minimum 50%
    }

    const points = Math.round(basePoints * multiplier);
    const efficiency = Math.round(multiplier * 100);

    return { points, efficiency, multiplier, basePoints };
}

function endNight() {
    state.isRunning = false;

    // Remove completed observations from available catalog
    state.completedObs.forEach(obs => {
        state.availableCatalog = state.availableCatalog.filter(o => o.id !== obs.id);
        state.weeklyCompletedObs.push(obs);
    });

    // Calculate nightly efficiency
    const totalPossible = state.completedObs.reduce((sum, obs) => sum + getObservationPoints(obs), 0);
    const nightlyEfficiency = totalPossible > 0 ? Math.round((state.totalScore / totalPossible) * 100) : 0;

    // Save daily results
    state.dailyResults.push({
        day: state.currentDay,
        dayName: DAY_NAMES[state.currentDay],
        score: state.totalScore,
        observations: [...state.completedObs],
        efficiency: nightlyEfficiency
    });

    // Add to weekly total
    state.weeklyScore += state.totalScore;

    elements.cameraStatus.textContent = 'COMPLETE';
    elements.cameraStatus.className = 'status-badge active';
    elements.queueStatus.textContent = 'Complete';
    elements.queueStatus.className = 'status-value status-badge active';

    // Check if week is complete
    if (state.currentDay >= 6) {
        showWeeklySummary();
    } else {
        showNightResults();
    }
}

function showNightResults() {
    const totalPossible = state.completedObs.reduce((sum, obs) => sum + getObservationPoints(obs), 0);
    const avgEfficiency = totalPossible > 0 ? Math.round((state.totalScore / totalPossible) * 100) : 0;

    // Update modal for nightly results
    document.querySelector('#resultsModal h2').textContent = `🌙 Night ${state.currentDay + 1} Complete!`;

    elements.finalScore.textContent = state.totalScore;
    elements.obsCompleted.textContent = state.completedObs.length;
    elements.avgScore.textContent = `${avgEfficiency}%`;

    // Update labels for nightly view
    document.querySelectorAll('.result-label')[0].textContent = 'Tonight\'s Points';
    document.querySelectorAll('.result-label')[1].textContent = 'Observations';
    document.querySelectorAll('.result-label')[2].textContent = 'Efficiency';

    elements.observationResults.innerHTML = `
        <div class="weekly-progress-summary">
            <div class="weekly-stat">
                <span class="weekly-stat-value">${state.weeklyScore}</span>
                <span class="weekly-stat-label">Weekly Total</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-stat-value">${state.weeklyCompletedObs.length}/${OBSERVATION_CATALOG.length}</span>
                <span class="weekly-stat-label">Total Observed</span>
            </div>
            <div class="weekly-stat">
                <span class="weekly-stat-value">${7 - state.currentDay - 1}</span>
                <span class="weekly-stat-label">Nights Left</span>
            </div>
        </div>
        <h4 style="margin: 1rem 0 0.5rem; color: var(--text-secondary);">Tonight's Observations:</h4>
        ${state.completedObs.map(obs => {
            const maxPoints = getObservationPoints(obs);
            const scoreClass = obs.efficiency >= 80 ? 'good' : obs.efficiency >= 50 ? 'ok' : 'poor';
            return `
                <div class="obs-result">
                    <span class="obs-result-name">${obs.icon} ${obs.name}</span>
                    <span class="obs-result-score ${scoreClass}">+${obs.score} / ${maxPoints}</span>
                </div>
            `;
        }).join('')}
    `;

    elements.closeModalBtn.textContent = `Continue to Night ${state.currentDay + 2}`;
    elements.resultsModal.classList.remove('hidden');
}

function showWeeklySummary() {
    // Show name input modal first, then show the summary
    showNameInputModal();
}

function showNameInputModal() {
    elements.highScoresModal.classList.remove('hidden');

    // Show the score prominently in the dialog
    elements.highScoresList.innerHTML = `
        <div class="name-entry-score">
            <div class="score-display-large">
                <span class="score-label">Your Final Score</span>
                <span class="score-value">${state.weeklyScore}</span>
            </div>
            <p class="score-prompt">Enter your name to save your score to the leaderboard!</p>
        </div>
    `;

    // Always show submit section for name entry (required)
    elements.submitScoreSection.classList.remove('hidden');
    elements.playerNameInput.value = '';
    elements.playerNameInput.focus();

    // Update submit button to indicate this is required
    elements.submitScoreBtn.textContent = 'Save Score & Continue';
    elements.submitScoreBtn.disabled = false;

    // Hide close button until name is entered
    elements.closeHighScoresBtn.style.display = 'none';
}

function showWeeklySummaryContent() {
    // Calculate weekly stats
    const totalPossibleWeekly = state.weeklyCompletedObs.reduce((sum, obs) => sum + getObservationPoints(obs), 0);
    const weeklyEfficiency = totalPossibleWeekly > 0 ? Math.round((state.weeklyScore / totalPossibleWeekly) * 100) : 0;
    const maxPossibleScore = OBSERVATION_CATALOG.reduce((sum, obs) => sum + getObservationPoints(obs), 0);
    const completionRate = Math.round((state.weeklyCompletedObs.length / OBSERVATION_CATALOG.length) * 100);

    // Calculate running totals for the breakdown
    let runningTotal = 0;
    const dailyWithRunning = state.dailyResults.map(day => {
        runningTotal += day.score;
        return { ...day, runningTotal };
    });

    // Determine rating
    let rating, ratingEmoji;
    if (weeklyEfficiency >= 90 && completionRate >= 80) {
        rating = 'Outstanding Queue Coordinator!';
        ratingEmoji = '🏆';
    } else if (weeklyEfficiency >= 75 && completionRate >= 60) {
        rating = 'Excellent Observer!';
        ratingEmoji = '🌟';
    } else if (weeklyEfficiency >= 60 && completionRate >= 40) {
        rating = 'Good Work!';
        ratingEmoji = '👍';
    } else {
        rating = 'Keep Practicing!';
        ratingEmoji = '📚';
    }

    document.querySelector('#resultsModal h2').textContent = `${ratingEmoji} Week Complete!`;

    elements.finalScore.textContent = state.weeklyScore;
    elements.obsCompleted.textContent = state.weeklyCompletedObs.length;
    elements.avgScore.textContent = `${weeklyEfficiency}%`;

    // Update labels for weekly view
    document.querySelectorAll('.result-label')[0].textContent = 'Weekly Total';
    document.querySelectorAll('.result-label')[1].textContent = 'Total Observed';
    document.querySelectorAll('.result-label')[2].textContent = 'Avg Efficiency';

    elements.observationResults.innerHTML = `
        <div class="weekly-rating">
            <span class="rating-emoji">${ratingEmoji}</span>
            <span class="rating-text">${rating}</span>
        </div>

        <div class="weekly-stats-grid">
            <div class="weekly-final-stat">
                <span class="stat-icon">🎯</span>
                <span class="stat-value">${state.weeklyScore} / ${maxPossibleScore}</span>
                <span class="stat-label">Max Possible Score</span>
            </div>
            <div class="weekly-final-stat">
                <span class="stat-icon">📊</span>
                <span class="stat-value">${completionRate}%</span>
                <span class="stat-label">Catalog Completion</span>
            </div>
        </div>

        <h4 style="margin: 1rem 0 0.5rem; color: var(--text-secondary);">Nightly Breakdown:</h4>
        <div class="nightly-breakdown">
            <div class="night-result header">
                <span class="night-name">Night</span>
                <span class="night-obs">Obs</span>
                <span class="night-score">Score</span>
                <span class="night-total">Total</span>
            </div>
            ${dailyWithRunning.map(day => `
                <div class="night-result">
                    <span class="night-name">${day.dayName}</span>
                    <span class="night-obs">${day.observations.length}</span>
                    <span class="night-score ${day.efficiency >= 80 ? 'good' : day.efficiency >= 50 ? 'ok' : 'poor'}">+${day.score}</span>
                    <span class="night-total">${day.runningTotal}</span>
                </div>
            `).join('')}
            <div class="night-result total-row">
                <span class="night-name">TOTAL</span>
                <span class="night-obs">${state.weeklyCompletedObs.length}</span>
                <span class="night-score"></span>
                <span class="night-total">${state.weeklyScore}</span>
            </div>
        </div>

        <button id="viewHighScoresBtn" class="btn btn-secondary" style="width: 100%; margin: 1rem 0;" onclick="showHighScores()">
            View High Scores
        </button>

        ${state.availableCatalog.length > 0 ? `
            <h4 style="margin: 1rem 0 0.5rem; color: var(--text-secondary);">Missed Observations (${state.availableCatalog.length}):</h4>
            <div class="missed-obs">
                ${state.availableCatalog.slice(0, 10).map(obs => `
                    <span class="missed-obs-item">${obs.icon} ${obs.name}</span>
                `).join('')}
                ${state.availableCatalog.length > 10 ? `<span class="missed-obs-item">+${state.availableCatalog.length - 10} more</span>` : ''}
            </div>
        ` : `
            <div class="perfect-completion">
                <span>🎉</span>
                <p>Perfect! You completed the entire catalog!</p>
            </div>
        `}
    `;

    elements.closeModalBtn.textContent = 'Start New Week';
    elements.resultsModal.classList.remove('hidden');
}

// ===================================
// HIGH SCORES SYSTEM
// ===================================
async function showHighScores() {
    elements.highScoresModal.classList.remove('hidden');
    elements.highScoresList.innerHTML = '<div class="loading-scores">Loading scores...</div>';

    // Hide submit section when viewing high scores (score already submitted)
    elements.submitScoreSection.classList.add('hidden');

    // Make sure close button is visible
    elements.closeHighScoresBtn.style.display = '';

    // Reset submit button text
    elements.submitScoreBtn.textContent = 'Submit Score';
    elements.submitScoreBtn.disabled = false;

    try {
        const response = await fetch('/api/scores');
        const scores = await response.json();

        if (scores.length === 0) {
            elements.highScoresList.innerHTML = `
                <div class="no-scores">
                    <span>🌟</span>
                    <p>No high scores yet. Be the first to complete a week!</p>
                </div>
            `;
            return;
        }

        elements.highScoresList.innerHTML = scores.map((score, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            const date = new Date(score.date).toLocaleDateString();

            return `
                <div class="high-score-item">
                    <span class="high-score-rank ${rankClass}">${rank}</span>
                    <div class="high-score-info">
                        <div class="high-score-name">${escapeHtml(score.name)}</div>
                        <div class="high-score-details">${score.observations} obs • ${score.efficiency}% eff • ${date}</div>
                    </div>
                    <span class="high-score-value">${score.score}</span>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Failed to load high scores:', error);
        elements.highScoresList.innerHTML = `
            <div class="no-scores">
                <span>⚠️</span>
                <p>Failed to load high scores. Please try again.</p>
            </div>
        `;
    }
}

async function submitScore() {
    const name = elements.playerNameInput.value.trim();
    if (!name) {
        elements.playerNameInput.focus();
        elements.playerNameInput.style.borderColor = 'var(--accent-danger)';
        return;
    }
    elements.playerNameInput.style.borderColor = '';

    const totalPossibleWeekly = state.weeklyCompletedObs.reduce((sum, obs) => sum + getObservationPoints(obs), 0);
    const weeklyEfficiency = totalPossibleWeekly > 0 ? Math.round((state.weeklyScore / totalPossibleWeekly) * 100) : 0;

    elements.submitScoreBtn.disabled = true;
    elements.submitScoreBtn.textContent = 'Saving...';

    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name,
                score: state.weeklyScore,
                observations: state.weeklyCompletedObs.length,
                efficiency: weeklyEfficiency
            })
        });

        const result = await response.json();

        if (result.success) {
            state.scoreSubmitted = true;
            elements.submitScoreSection.classList.add('hidden');

            // Close the high scores modal
            elements.highScoresModal.classList.add('hidden');
            elements.closeHighScoresBtn.style.display = '';

            // Now show the weekly summary
            showWeeklySummaryContent();
        } else {
            // Handle server error response (e.g., validation error)
            console.error('Failed to submit score:', result.error || 'Unknown error');
            alert(result.error || 'Failed to submit score. Please try again.');
            elements.submitScoreBtn.disabled = false;
            elements.submitScoreBtn.textContent = 'Save Score & Continue';
        }
    } catch (error) {
        console.error('Failed to submit score:', error);
        alert('Failed to submit score. Please try again.');
        elements.submitScoreBtn.disabled = false;
        elements.submitScoreBtn.textContent = 'Save Score & Continue';
    }
}

function highlightPlayerScore(rank) {
    const items = elements.highScoresList.querySelectorAll('.high-score-item');
    if (items[rank - 1]) {
        items[rank - 1].classList.add('current-player');
        items[rank - 1].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function closeHighScoresModal() {
    elements.highScoresModal.classList.add('hidden');
    elements.playerNameInput.value = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make showHighScores globally accessible
window.showHighScores = showHighScores;

function closeModal() {
    elements.resultsModal.classList.add('hidden');

    if (state.currentDay >= 6) {
        // Week is complete, full reset
        resetSimulation();
    } else {
        // Move to next night
        advanceToNextNight();
    }
}

function advanceToNextNight() {
    state.currentDay++;
    state.currentObsIndex = -1;
    state.observationProgress = 0;
    state.totalScore = 0;
    state.completedObs = [];
    state.nightlyQueue = [];
    state.simTime = new Date(2024, 0, 15 + state.currentDay, 19, 0, 0);
    state.isSlewing = false;

    // Set up weather for the new day
    setCurrentDayForecast();

    elements.cameraStatus.textContent = 'IDLE';
    elements.cameraStatus.className = 'status-badge';
    elements.queueStatus.textContent = 'Waiting';
    elements.queueStatus.className = 'status-value status-badge idle';
    elements.totalScore.textContent = state.weeklyScore;
    elements.obsComplete.textContent = '0 / 0';
    elements.currentTargetInfo.innerHTML = '<span class="no-target">No target selected</span>';
    elements.observationProgress.classList.add('hidden');
    elements.lastScore.classList.add('hidden');

    renderWeeklyForecast();
    renderCatalog();
    renderQueue();
    updateWeatherDisplay();
    updateDayDisplay();
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

    // Full reset of weekly state
    initializeWeek();

    elements.cameraStatus.textContent = 'IDLE';
    elements.cameraStatus.className = 'status-badge';
    elements.queueStatus.textContent = 'Waiting';
    elements.queueStatus.className = 'status-value status-badge idle';
    elements.totalScore.textContent = '0';
    elements.obsComplete.textContent = '0 / 0';
    elements.currentTargetInfo.innerHTML = '<span class="no-target">No target selected</span>';
    elements.observationProgress.classList.add('hidden');
    elements.lastScore.classList.add('hidden');

    renderCatalog();
    renderQueue();
    updateWeatherDisplay();
    updateDayDisplay();
}

// ===================================
// WEATHER SYSTEM
// ===================================
function updateWeatherFromForecast() {
    const currentHour = state.simTime.getHours();
    const forecastBlock = state.currentDayForecast.find(f => f.hour === currentHour) || state.currentDayForecast[0];

    if (forecastBlock) {
        // Smooth transition to forecast values
        state.weather.clouds += (forecastBlock.clouds - state.weather.clouds) * 0.1;
        state.weather.seeing += (forecastBlock.seeing - state.weather.seeing) * 0.1;
        state.weather.humidity += (forecastBlock.humidity - state.weather.humidity) * 0.1;

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

    // Update IQ label based on current seeing
    const iqLabel = getIQFromSeeing(state.weather.seeing);
    elements.seeingIQ.textContent = iqLabel;
    elements.seeingIQ.className = `metric-iq ${iqLabel.toLowerCase()}`;

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
    // Stars only move during slewing (telescope is tracking the target when observing)
    const isTracking = state.isRunning && !state.isSlewing;
    const siderealDrift = state.isSlewing ? CONFIG.SIDEREAL_RATE * 15 : (isTracking ? 0 : CONFIG.SIDEREAL_RATE);
    const time = Date.now() / 1000;

    state.stars.forEach(star => {
        // Sidereal motion - only when not tracking a target
        if (siderealDrift > 0) {
            star.x -= siderealDrift * (deltaTime / 1000) * 60;

            // Wrap around
            if (star.x < 0) {
                star.x = canvas.width;
                star.y = Math.random() * canvas.height;
            }
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
    // Cloud overlay - realistic fluffy clouds with independent wind-driven movement
    if (state.weather.clouds > 5) {
        // Clouds move faster during slew to simulate telescope movement
        const baseCloudSpeed = state.isSlewing ? CONFIG.CLOUD_SLEW_SPEED : CONFIG.CLOUD_WIND_SPEED;
        const windTime = Date.now() / 1000; // Time in seconds for smooth wind animation
        const numClouds = Math.floor(state.weather.clouds / 5) + 2;
        const baseAlpha = Math.min((state.weather.clouds / 100) * 0.85, 0.85);

        for (let i = 0; i < numClouds; i++) {
            // Each cloud has its own speed variation (wind gusts)
            const cloudSpeed = baseCloudSpeed * (0.7 + (i % 3) * 0.3);
            // Clouds drift across the sky driven by wind (independent of star movement)
            const baseX = ((i * 173 + windTime * cloudSpeed) % (canvas.width + 300)) - 150;
            const baseY = (Math.sin(i * 0.7 + 0.3) * 0.35 + 0.5) * canvas.height;
            // Slight vertical bobbing to simulate turbulence
            const turbulence = Math.sin(windTime * 0.5 + i * 1.3) * 3;
            const cloudScale = 0.8 + (i % 4) * 0.3;

            // Draw a fluffy cloud using multiple overlapping circles
            const puffs = [
                { ox: 0, oy: 0, r: 45 * cloudScale },
                { ox: -35 * cloudScale, oy: 10 * cloudScale, r: 35 * cloudScale },
                { ox: 40 * cloudScale, oy: 5 * cloudScale, r: 40 * cloudScale },
                { ox: -60 * cloudScale, oy: 15 * cloudScale, r: 28 * cloudScale },
                { ox: 70 * cloudScale, oy: 12 * cloudScale, r: 32 * cloudScale },
                { ox: 20 * cloudScale, oy: -15 * cloudScale, r: 30 * cloudScale },
                { ox: -20 * cloudScale, oy: -12 * cloudScale, r: 28 * cloudScale },
                { ox: 50 * cloudScale, oy: -8 * cloudScale, r: 25 * cloudScale },
                { ox: -45 * cloudScale, oy: -5 * cloudScale, r: 22 * cloudScale },
            ];

            // Draw shadow layer first (darker, offset down)
            puffs.forEach(puff => {
                const px = baseX + puff.ox;
                const py = baseY + puff.oy + turbulence + 8;
                const gradient = ctx.createRadialGradient(px, py, 0, px, py, puff.r * 1.2);
                gradient.addColorStop(0, `rgba(40, 45, 55, ${baseAlpha * 0.4})`);
                gradient.addColorStop(0.6, `rgba(50, 55, 65, ${baseAlpha * 0.25})`);
                gradient.addColorStop(1, 'rgba(60, 65, 75, 0)');

                ctx.beginPath();
                ctx.arc(px, py, puff.r * 1.2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Draw main cloud puffs (lighter, fluffy appearance)
            puffs.forEach(puff => {
                const px = baseX + puff.ox;
                const py = baseY + puff.oy + turbulence;
                const gradient = ctx.createRadialGradient(px, py - 5, 0, px, py, puff.r);
                gradient.addColorStop(0, `rgba(200, 205, 215, ${baseAlpha * 0.9})`);
                gradient.addColorStop(0.3, `rgba(160, 165, 180, ${baseAlpha * 0.7})`);
                gradient.addColorStop(0.6, `rgba(120, 125, 140, ${baseAlpha * 0.5})`);
                gradient.addColorStop(1, 'rgba(90, 95, 110, 0)');

                ctx.beginPath();
                ctx.arc(px, py, puff.r, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Add bright highlights on top of the cloud
            const highlightPuffs = [
                { ox: -10 * cloudScale, oy: -20 * cloudScale, r: 20 * cloudScale },
                { ox: 25 * cloudScale, oy: -18 * cloudScale, r: 18 * cloudScale },
            ];

            highlightPuffs.forEach(puff => {
                const px = baseX + puff.ox;
                const py = baseY + puff.oy + turbulence;
                const gradient = ctx.createRadialGradient(px, py, 0, px, py, puff.r);
                gradient.addColorStop(0, `rgba(240, 245, 255, ${baseAlpha * 0.5})`);
                gradient.addColorStop(0.5, `rgba(220, 225, 235, ${baseAlpha * 0.25})`);
                gradient.addColorStop(1, 'rgba(200, 205, 215, 0)');

                ctx.beginPath();
                ctx.arc(px, py, puff.r, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            });
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
