import { MahjongTiles } from './lib/mahjong/tiles/index';
import { MahjongSuits } from './lib/mahjong/type';
import {
  YakuChecker,
  GroupType,
  YakuInfo,
  WaitingType,
  yakuRequirementRegistry,
} from './lib/mahjong/typecheck/yaku';
import { MahjongYakuCounter } from './lib/mahjong/score/yakuCounter';
import { register } from './lib/mahjong/typecheck/register';
import { MahjongYakuTypes } from './lib/mahjong/typecheck/index';

// Global functions for HTML to call
declare global {
  interface Window {
    showTab: (tabName: string) => void;
    analyzeTiles: () => void;
    loadRandomExample: () => void;
    loadSpecificExample: (tiles: string) => void;
    generateRandomHand: (type: string) => void;
    clearInput: () => void;
    addCustomYaku: () => void;
    testCustomYaku: () => void;
    clearCustomYaku: () => void;
    loadCustomYakuExample: (exampleType: string) => void;
    removeCustomYaku: (index: number) => void;
    editCustomYaku: (index: number) => void;
    saveEditedYaku: (index: number) => void;
    cancelEditYaku: () => void;
    showYakuLibrary: () => void;
    selectFromLibrary: (yakuId: string) => void;
    startCustomYakuTour: () => void;
    nextTourStep: () => void;
    skipTour: () => void;
    toggleYakuRegistration: (yakuType: string, enabled: boolean) => void;
    showYakuManager: () => void;
    saveCustomYakuCache: () => void;
    loadCustomYakuCache: () => void;
    toggleYakuEnabled: (yakuType: string, enabled: boolean) => void;
    showYakuBrowser: () => void;
  }
}

// Tab management
window.showTab = function (tabName: string) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach((content) => {
    content.classList.remove('active');
  });

  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach((button) => {
    button.classList.remove('active');
  });

  // Show selected tab content
  const selectedTab = document.getElementById(tabName);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Add active class to clicked button
  const clickedButton = document.querySelector(
    `[onclick="showTab('${tabName}')"]`,
  );
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
};

// Tile parsing function
function parseTiles(input: string): MahjongTiles[] {
  const tiles: MahjongTiles[] = [];
  const regex = /(\d+)([mps])|(\d+)z/g;
  let match;

  while ((match = regex.exec(input)) !== null) {
    if (match[1] && match[2]) {
      // Number tiles (1-9m/p/s)
      const numbers = match[1];
      const suitChar = match[2];
      const suit =
        suitChar === 'm'
          ? MahjongSuits.MAN
          : suitChar === 'p'
          ? MahjongSuits.PIN
          : MahjongSuits.SOU;

      for (const numChar of numbers) {
        const num = parseInt(numChar);
        if (num >= 1 && num <= 9) {
          tiles.push(
            new MahjongTiles({ suits: suit, number: num, isRed: false }),
          );
        }
      }
    } else if (match[3]) {
      // Honor tiles (1-7z) - now handles multiple digits
      const numbers = match[3];
      for (const numChar of numbers) {
        const num = parseInt(numChar);
        if (num >= 1 && num <= 7) {
          const suit = num <= 4 ? MahjongSuits.WIND : MahjongSuits.DRAGON;
          const adjustedNum = num <= 4 ? num : num - 4;
          tiles.push(
            new MahjongTiles({
              suits: suit,
              number: adjustedNum,
              isRed: false,
            }),
          );
        }
      }
    }
  }

  return tiles;
}

// Tile display function
function displayTiles(tiles: MahjongTiles[]): string {
  return tiles
    .map((tile) => {
      const suitSymbol =
        tile.getSuit() === MahjongSuits.MAN
          ? 'M'
          : tile.getSuit() === MahjongSuits.PIN
          ? 'P'
          : tile.getSuit() === MahjongSuits.SOU
          ? 'S'
          : tile.getSuit() === MahjongSuits.WIND
          ? ['E', 'S', 'W', 'N'][tile.getNumber() - 1]
          : ['Wh', 'Gr', 'Re'][tile.getNumber() - 1];

      const number = tile.getSuit() <= MahjongSuits.SOU ? tile.getNumber() : '';
      const redClass = tile.isRedTile() ? ' red-tile' : '';

      return `<span class="tile${redClass}">${number}${suitSymbol}</span>`;
    })
    .join('');
}

// Get analysis options from checkboxes
function getAnalysisOptions(): YakuInfo {
  const isConcealed =
    (document.getElementById('isConcealed') as HTMLInputElement)?.checked ??
    true;
  const isTsumo =
    (document.getElementById('isTsumo') as HTMLInputElement)?.checked ?? false;
  const isRiichi =
    (document.getElementById('isRiichi') as HTMLInputElement)?.checked ?? false;
  const isFirstRound =
    (document.getElementById('isFirstRound') as HTMLInputElement)?.checked ??
    false;

  return {
    isConcealed,
    isTsumo,
    isRiichi,
    isFirstRound,
    waitingType: WaitingType.Ryanmen, // Default waiting type
  };
}

// Analyze tiles function
window.analyzeTiles = function () {
  const input = (document.getElementById('tilesInput') as HTMLTextAreaElement)
    .value;
  const resultsDiv = document.getElementById('analysisResults')!;

  if (!input.trim()) {
    resultsDiv.innerHTML = `
      <div class="alert alert-warning">
        <strong>Warning:</strong> Please enter a tile combination!
      </div>
    `;
    return;
  }

  // Initialize yaku system if not already done
  if (enabledYakus.size === 0) {
    initializeYakuSystem();
  }

  try {
    const tiles = parseTiles(input);

    if (tiles.length === 0) {
      resultsDiv.innerHTML = `
        <div class="alert alert-warning">
          <strong>Warning:</strong> No valid tiles found. Please check your input format.
        </div>
      `;
      return;
    }

    const tilesDisplay = displayTiles(tiles);
    const analysisOptions = getAnalysisOptions();

    // Yaku detection
    const groups = [
      {
        type: GroupType.None,
        tiles: tiles,
        isOpen: !analysisOptions.isConcealed,
      },
    ];

    const filteredEnabledYakus = new Set(
      Array.from(enabledYakus).filter((yaku) =>
        typeof yaku === 'string'
          ? true
          : Object.values(MahjongYakuTypes).includes(yaku),
      ) as MahjongYakuTypes[],
    );
    const checker = new YakuChecker(
      groups,
      analysisOptions,
      filteredEnabledYakus,
    );
    const results = checker.check();
    const yakuCounter = new MahjongYakuCounter();

    let resultHtml = `
      <div class="demo-section">
        <h3>Tile Display (${tiles.length} tiles):</h3>
        <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
          ${tilesDisplay}
        </div>
      </div>
    `;

    resultHtml += `
      <div class="demo-section">
        <h3>Detected Yaku:</h3>
    `;

    if (results.size === 0) {
      resultHtml += `
        <div class="alert alert-info">
          <strong>No Yaku Detected</strong><br>
          This hand doesn't form any valid yaku. Try different tile combinations or check if the hand is complete (14 tiles for a winning hand).
        </div>
      `;
    } else {
      let totalHan = 0;
      const yakuTypes = Array.from(results.keys());

      // Check for unusual combinations
      const hasMultipleYakuman =
        yakuTypes.filter((yaku) => yakuCounter.getYakuCount(yaku)?.isYakuman)
          .length > 1;
      const suspiciousYaku = yakuTypes.filter(
        (yaku) =>
          yaku.includes('KokushiMusou') ||
          yaku.includes('Chankan') ||
          yaku.includes('Ippatsu'),
      );

      yakuTypes.forEach((yakuName) => {
        const yakuRule = yakuCounter.getYakuCount(yakuName);
        const han = yakuRule?.han || 0;
        totalHan += han;

        resultHtml += `
          <div class="yaku-result">
            <strong>${yakuName}</strong>: ${han} han
            ${yakuRule?.isYakuman ? ' (Yakuman)' : ''}
            ${yakuRule?.isDoubleYakuman ? ' (Double Yakuman)' : ''}
          </div>
        `;
      });

      // Add warnings for unusual results
      if (hasMultipleYakuman || suspiciousYaku.length > 0 || totalHan > 30) {
        resultHtml += `
          <div class="alert alert-warning" style="margin-top: 15px;">
            <strong>Detection Notice:</strong> Some detected yaku may be due to system limitations. 
            Please verify results, especially for complex or rare yaku combinations.
          </div>
        `;
      }

      resultHtml += `
        <div class="alert alert-success" style="margin-top: 15px;">
          <strong>Total:</strong> ${totalHan} han (${results.size} different yaku)
        </div>
      `;
    }

    // Check custom yaku
    if (customYakuDefinitions.length > 0) {
      resultHtml += `
        <h4>Custom Yaku Check:</h4>
      `;

      let customYakuFound: string[] = [];
      let customHanTotal = 0;

      customYakuDefinitions.forEach((yaku) => {
        try {
          // Custom yakus are already registered in the main results
          // This section can show additional custom yaku info if needed
          if (results.has(yaku.yakuType as any)) {
            customYakuFound.push(`${yaku.name} (${yaku.han} han)`);
            customHanTotal += yaku.han;
          }
        } catch (error) {
          customYakuFound.push(
            `${yaku.name} - Error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      });

      if (customYakuFound.length > 0) {
        resultHtml += `
          <div class="alert alert-info" style="margin-top: 10px;">
            <strong>Detected Custom Yaku:</strong><br>
            ${customYakuFound.map((y) => `• ${y}`).join('<br>')}
            ${
              customHanTotal > 0
                ? `<br><strong>Custom Yaku Total Han:</strong> ${customHanTotal} han`
                : ''
            }
          </div>
        `;
      } else {
        resultHtml += `
          <div class="alert alert-secondary" style="margin-top: 10px;">
            No custom yaku detected
          </div>
        `;
      }
    }

    resultHtml += `</div>`;

    // Add analysis details
    resultHtml += `
      <div class="demo-section">
        <h3>Analysis Details:</h3>
        <ul style="list-style-position: inside; line-height: 1.8;">
          <li><strong>Hand Type:</strong> ${
            analysisOptions.isConcealed ? 'Concealed (Menzen)' : 'Open'
          }</li>
          <li><strong>Win Type:</strong> ${
            analysisOptions.isTsumo ? 'Self-Draw (Tsumo)' : 'Ron'
          }</li>
          <li><strong>Riichi:</strong> ${
            analysisOptions.isRiichi ? 'Yes' : 'No'
          }</li>
          <li><strong>First Round:</strong> ${
            analysisOptions.isFirstRound ? 'Yes' : 'No'
          }</li>
          <li><strong>Tile Count:</strong> ${tiles.length}</li>
        </ul>
      </div>
    `;

    // Add system limitations note
    resultHtml += `
      <div class="demo-section">
        <h3>System Limitations:</h3>
        <div class="alert alert-info">
          <strong>Note:</strong> This demo version has some limitations in yaku detection:
          <ul style="margin-top: 10px; margin-left: 20px; line-height: 1.6;">
            <li><strong>Not Implemented:</strong> Chankan, Ippatsu, Suukansanra</li>
            <li><strong>Partially Supported:</strong> Tenhou, Chihou, Renhou (require game state)</li>
            <li><strong>Limited Context:</strong> Some situational yaku may not be perfectly detected</li>
            <li><strong>Best Supported:</strong> Standard hand-based yaku (sequences, triplets, pairs)</li>
          </ul>
          <p style="margin-top: 10px;">
            For the most accurate results, use standard 14-tile winning hands with basic yaku patterns.
          </p>
        </div>
      </div>
    `;

    resultsDiv.innerHTML = resultHtml;
  } catch (error) {
    console.error('Error in analyzeTiles:', error);
    resultsDiv.innerHTML = `
      <div class="alert alert-warning">
        <strong>Parse Error:</strong> ${
          error instanceof Error ? error.message : 'Unknown error occurred'
        }
        <br><br>
        <strong>Format Guide:</strong>
        <ul style="margin-top: 10px; margin-left: 20px;">
          <li>Numbers + suit: 123m (man), 456p (pin), 789s (sou)</li>
          <li>Honor tiles: 1234z (winds), 567z (dragons)</li>
          <li>Example: 123m456p789s1122z</li>
        </ul>
      </div>
    `;
  }
};

// Load random example
window.loadRandomExample = function () {
  const examples = [
    '234m567p234s5566z', // Pinfu + Tanyao
    '123m234p345s1122z', // All simples
    '111m456p789s1133z', // Yakuhai
    '2244668m2244668p', // Seven pairs
    '123456789m1122m', // Pure straight
    '111m111p111s4455z', // Triple triplets
    '123m123p123s1144z', // Three color runs
    '111222m333p4455s', // All triplets
    '111222333456788m', // Full flush (Chinitsu)
    '123m456m78911z22z', // Half flush (Honitsu)
    '111999m111999p11z', // Terminals and honors
    '123789m123789p11z', // Outside hand (Junchan)
    '19m19p19s1234567z', // Thirteen orphans
    '111m222p333s444z5z', // Four concealed triplets
    '555666777z1122z', // Big three dragons
    '1111222233334z', // Little four winds
  ];

  const randomExample = examples[Math.floor(Math.random() * examples.length)];
  (document.getElementById('tilesInput') as HTMLTextAreaElement).value =
    randomExample;
  window.analyzeTiles();
};

// Load specific example
window.loadSpecificExample = function (tiles: string) {
  (document.getElementById('tilesInput') as HTMLTextAreaElement).value = tiles;
  window.analyzeTiles();
};

// Generate random hand
window.generateRandomHand = function (type: string) {
  let generatedHand = '';

  const basicHands = [
    '234m567p891s112z2z',
    '345m678p123s445z5z',
    '456m789p234s667z7z',
    '567m123p345s119z9z',
  ];

  const complexHands = [
    '111222333456788m',
    '123m123p123s114z4z',
    '111m111p777s223z3z',
    '999m888p777s556z6z',
  ];

  const honorHands = [
    '123m456p1122334z5z',
    '789m111z222z333z44z',
    '234p567s1122334z5z',
    '345m678p555z666z77z',
  ];

  const terminalHands = [
    '111999m111999p11z',
    '119m119p119s123z4z',
    '999m111p999s117z7z',
    '111m999m111p999p1z',
  ];

  const mixedHands = [
    '123m456p789s117z7z',
    '234m567p891s224z4z',
    '345m678p123s335z5z',
    '456m789p234s446z6z',
  ];

  const flushHands = [
    '111222333456788m',
    '234567891p334p4p',
    '345678912s445s5s',
    '123456789m112m2m',
  ];

  switch (type) {
    case 'basic':
      generatedHand = basicHands[Math.floor(Math.random() * basicHands.length)];
      break;
    case 'complex':
      generatedHand =
        complexHands[Math.floor(Math.random() * complexHands.length)];
      break;
    case 'honors':
      generatedHand = honorHands[Math.floor(Math.random() * honorHands.length)];
      break;
    case 'terminals':
      generatedHand =
        terminalHands[Math.floor(Math.random() * terminalHands.length)];
      break;
    case 'mixed':
      generatedHand = mixedHands[Math.floor(Math.random() * mixedHands.length)];
      break;
    case 'flush':
      generatedHand = flushHands[Math.floor(Math.random() * flushHands.length)];
      break;
    default:
      generatedHand = basicHands[Math.floor(Math.random() * basicHands.length)];
  }

  (document.getElementById('tilesInput') as HTMLTextAreaElement).value =
    generatedHand;
  window.analyzeTiles();
};

// Clear input
window.clearInput = function () {
  (document.getElementById('tilesInput') as HTMLTextAreaElement).value = '';
  const resultsDiv = document.getElementById('analysisResults')!;
  resultsDiv.innerHTML = '';
};

// Store custom yaku definitions that will be added to the registry
const customYakuDefinitions: Array<{
  yakuType: string; // Custom yaku identifier
  name: string;
  han: number;
  requirements: any; // RonRequirements object
}> = [];

// Yaku registration system - stores which yakus are enabled
const enabledYakus = new Set<MahjongYakuTypes | string>();
const disabledYakus = new Set<MahjongYakuTypes | string>();

// Custom yaku cache key
const CUSTOM_YAKU_CACHE_KEY = 'mahjong_custom_yaku_registry_cache';

// Incomplete yakus that should be disabled by default
const incompleteYakus = new Set([
  MahjongYakuTypes.Chankan,
  MahjongYakuTypes.Ippatsu,
  MahjongYakuTypes.Rinsyan,
  MahjongYakuTypes.Suukansanra,
  MahjongYakuTypes.SuufuuRenda,
]);

// Built-in yakus from register.ts (for reference)
// const builtinYakus = new Set<MahjongYakuTypes>();

// Predefined yaku library for users to select from - using registry format
const yakuLibrary = {
  'no-terminals': {
    name: 'No Terminals Custom',
    han: 1,
    description: 'Hand contains only tiles 2-8, no terminals or honors',
    definition: {
      requires: [
        {
          filteredNumbers: [1, 9],
          allowedSuits: ['MAN', 'PIN', 'SOU'],
        },
      ],
    },
    testHand: '234m567p234s5566s',
  },
  'all-sequences': {
    name: 'All Sequences Custom',
    han: 1,
    description: 'Hand made of only sequences',
    definition: {
      requires: [
        {
          minUnits: {
            Shuntsu: 4,
            Toitsu: 1,
          },
          allowedSuits: ['MAN', 'PIN', 'SOU'],
        },
      ],
    },
    testHand: '123m456p789s2233p',
  },
  'triplets-only': {
    name: 'All Triplets Custom',
    han: 2,
    description: 'Hand contains only triplets and one pair',
    definition: {
      requires: [
        {
          minUnits: {
            Koutsu: 4,
            Toitsu: 1,
          },
        },
      ],
    },
    testHand: '111m222p333s444z5z',
  },
  'honor-heavy': {
    name: 'Honor Heavy',
    han: 2,
    description: 'Hand contains multiple honor triplets',
    definition: {
      requires: [
        {
          minUnits: {
            Koutsu: 2,
          },
          requiredSuits: ['WIND', 'DRAGON'],
        },
      ],
    },
    testHand: '111z222z333m4455m',
  },
  'concealed-only': {
    name: 'Concealed Only',
    han: 1,
    description: 'Must be completely concealed hand',
    definition: {
      requireConcealed: true,
      requires: [
        {
          allowedSuits: ['MAN', 'PIN', 'SOU'],
        },
      ],
    },
    testHand: '123m456p789s2233p',
  },
  'tsumo-only': {
    name: 'Self-Draw Only',
    han: 1,
    description: 'Must be won by self-draw',
    definition: {
      requiredTsumo: true,
      requires: [
        {
          allowedSuits: ['MAN', 'PIN', 'SOU'],
        },
      ],
    },
    testHand: '123m456p789s2233p',
  },
};

// Initialize yaku system
function initializeYakuSystem() {
  // Clear existing registry
  yakuRequirementRegistry.clear();

  // Register all yakus first
  register();

  // Then disable the incomplete ones and any user-disabled ones
  const allYakus = Array.from(yakuRequirementRegistry.keys());
  enabledYakus.clear();

  allYakus.forEach((yakuType) => {
    if (!incompleteYakus.has(yakuType)) {
      enabledYakus.add(yakuType);
    }
  });
}

// Tour state
let tourState = {
  active: false,
  currentStep: 0,
  steps: [
    {
      title: 'Welcome to Custom Yaku!',
      content:
        'Custom yaku allow you to create your own scoring patterns beyond standard mahjong rules.',
      target: '.custom-yaku-form',
    },
    {
      title: 'JSON Definitions',
      content:
        'Instead of complex code, we use simple JSON to define yaku rules. No programming needed!',
      target: '#customYakuDefinition',
    },
    {
      title: 'Yaku Library',
      content:
        'Browse our library of pre-made custom yaku or create your own from scratch.',
      target: '.yaku-library-section',
    },
    {
      title: 'Test Your Yaku',
      content:
        'Use the test button to see if your yaku works with the current hand in the analyzer.',
      target: '.test-custom-yaku-btn',
    },
    {
      title: 'Manage Your Collection',
      content:
        'Edit, remove, or organize your custom yaku collection as you experiment.',
      target: '#activeCustomYaku',
    },
  ],
};

// Custom yaku functions
window.addCustomYaku = function () {
  const nameInput = document.getElementById(
    'customYakuName',
  ) as HTMLInputElement;
  const hanInput = document.getElementById('customYakuHan') as HTMLInputElement;
  const definitionInput = document.getElementById(
    'customYakuDefinition',
  ) as HTMLTextAreaElement;

  const name = nameInput.value.trim();
  const han = parseInt(hanInput.value);
  const definitionText = definitionInput.value.trim();

  if (!name || !han || !definitionText) {
    alert('Please fill in all fields');
    return;
  }

  if (han < 1 || han > 13) {
    alert('Han value must be between 1-13');
    return;
  }

  try {
    // Parse registry requirements definition
    let requirements;
    try {
      requirements = JSON.parse(definitionText);
    } catch (e) {
      alert(
        'Invalid JSON format. Please check your yaku requirements definition.',
      );
      return;
    }

    // Validate requirements object structure
    if (typeof requirements !== 'object' || requirements === null) {
      alert(
        'Requirements must be a valid object with yaku definition properties.',
      );
      return;
    }

    // Generate unique yaku type identifier
    const yakuType = `CUSTOM_${name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')}_${Date.now()}`;

    // Test register the yaku temporarily to validate
    try {
      yakuRequirementRegistry.register(yakuType as any, requirements);
      // If successful, remove the test registration
      yakuRequirementRegistry.remove(yakuType as any);
    } catch (error) {
      alert(
        `Invalid yaku requirements: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return;
    }

    // Add to custom yaku definitions
    customYakuDefinitions.push({
      yakuType,
      name,
      han,
      requirements,
    });

    // Re-initialize the yaku system
    initializeYakuSystem();

    // Clear form
    nameInput.value = '';
    hanInput.value = '';
    definitionInput.value = '';

    // Update displays
    updateCustomYakuDisplay();
    updateYakuBrowserDisplay();

    alert(`Custom yaku "${name}" (${han} han) added successfully to registry!`);
  } catch (error) {
    alert(
      `Definition error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

window.testCustomYaku = function () {
  const tilesInput = document.getElementById(
    'tilesInput',
  ) as HTMLTextAreaElement;
  const tiles = parseTiles(tilesInput.value);

  if (tiles.length === 0) {
    alert('Please enter tiles in the analyzer tab first');
    return;
  }

  // Re-run the full analysis to see all yakus including custom ones
  const resultDiv = document.getElementById('customYakuTestResult')!;
  resultDiv.innerHTML =
    '<p>Running full analysis... Check the Hand Analyzer tab for results including custom yaku.</p>';

  // Trigger full analysis
  window.analyzeTiles();
};

window.clearCustomYaku = function () {
  if (
    confirm(
      'Are you sure you want to clear all custom yaku? (This will not affect cached yaku)',
    )
  ) {
    customYakuDefinitions.length = 0;
    initializeYakuSystem(); // Re-register without custom yakus
    updateCustomYakuDisplay();
    updateYakuBrowserDisplay();
    document.getElementById('customYakuTestResult')!.innerHTML = '';
  }
};

// Yaku registration functions
window.toggleYakuRegistration = function (yakuType: string, enabled: boolean) {
  const yaku = yakuType as MahjongYakuTypes;
  if (enabled) {
    enabledYakus.add(yaku);
  } else {
    enabledYakus.delete(yaku);
  }
  console.log(`Yaku ${yakuType} ${enabled ? 'enabled' : 'disabled'}`);
};

window.showYakuManager = function () {
  const modal = document.getElementById('yakuManagerModal');
  if (modal) {
    modal.style.display = 'block';
    updateYakuManagerDisplay();
  }
};

// Yaku browser functions
function updateYakuBrowserDisplay() {
  const content = document.getElementById('yakuBrowserContent');
  if (!content) return;

  // Get all yakus from registry
  const allYakus = Array.from(yakuRequirementRegistry.keys());
  const builtin = allYakus.filter((yaku) =>
    Object.values(MahjongYakuTypes).includes(yaku as MahjongYakuTypes),
  );
  const custom = allYakus.filter(
    (yaku) =>
      !Object.values(MahjongYakuTypes).includes(yaku as MahjongYakuTypes),
  );

  let html = `
    <div class="yaku-browser-header">
      <h3>Yaku Browser & Manager</h3>
      <p>Manage all yakus registered in the system. Built-in yakus can be disabled, custom yakus can be deleted.</p>
    </div>
  `;

  // Built-in yakus section
  html += `
    <div class="yaku-section">
      <h4>Built-in Yakus (${builtin.length})</h4>
      <div class="yaku-grid">
  `;

  builtin.forEach((yakuType) => {
    const isEnabled = enabledYakus.has(yakuType);
    const isIncomplete = incompleteYakus.has(yakuType as MahjongYakuTypes);

    html += `
      <div class="yaku-item ${isIncomplete ? 'incomplete' : ''} ${
      isEnabled ? 'enabled' : 'disabled'
    }">
        <div class="yaku-header">
          <label class="yaku-checkbox-label">
            <input type="checkbox" 
                   ${isEnabled ? 'checked' : ''}
                   onchange="toggleYakuEnabled('${yakuType}', this.checked)"
                   ${
                     isIncomplete
                       ? 'title="This yaku has incomplete implementation"'
                       : ''
                   }>
            <span class="yaku-name">${yakuType}</span>
          </label>
          ${
            isIncomplete
              ? '<span class="incomplete-badge">Incomplete</span>'
              : ''
          }
        </div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  // Custom yakus section
  html += `
    <div class="yaku-section">
      <h4>Custom Yakus (${custom.length})</h4>
      <div class="yaku-grid">
  `;

  customYakuDefinitions.forEach((yaku, index) => {
    const isEnabled = enabledYakus.has(yaku.yakuType);

    html += `
      <div class="yaku-item custom ${isEnabled ? 'enabled' : 'disabled'}">
        <div class="yaku-header">
          <label class="yaku-checkbox-label">
            <input type="checkbox" 
                   ${isEnabled ? 'checked' : ''}
                   onchange="toggleYakuEnabled('${
                     yaku.yakuType
                   }', this.checked)">
            <span class="yaku-name">${yaku.name}</span>
            <span class="yaku-han">(${yaku.han} han)</span>
          </label>
          <button class="btn btn-sm btn-secondary" onclick="editCustomYaku(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="removeCustomYaku(${index})">Delete</button>
        </div>
        <div class="yaku-type">Type: <code>${yaku.yakuType}</code></div>
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  // Summary
  html += `
    <div class="yaku-browser-footer">
      <p><strong>Total Yakus:</strong> ${allYakus.length}</p>
      <p><strong>Enabled:</strong> ${enabledYakus.size} | <strong>Built-in:</strong> ${builtin.length} | <strong>Custom:</strong> ${custom.length}</p>
    </div>
  `;

  content.innerHTML = html;
}

// Toggle yaku enabled/disabled
window.toggleYakuEnabled = function (yakuType: string, enabled: boolean) {
  if (enabled) {
    enabledYakus.add(yakuType);
    disabledYakus.delete(yakuType);
  } else {
    enabledYakus.delete(yakuType);
    disabledYakus.add(yakuType);
  }
  console.log(`Yaku ${yakuType} ${enabled ? 'enabled' : 'disabled'}`);
};

// Show yaku browser modal
window.showYakuBrowser = function () {
  const modal = document.getElementById('yakuBrowserModal');
  if (modal) {
    modal.style.display = 'block';
    updateYakuBrowserDisplay();
  }
};

function updateYakuManagerDisplay() {
  const content = document.getElementById('yakuManagerContent');
  if (!content) return;

  // Ensure yaku system is initialized
  if (enabledYakus.size === 0) {
    initializeYakuSystem();
  }

  const allYakus = Array.from(yakuRequirementRegistry.keys());
  const yakuHTML = allYakus
    .map((yakuType) => {
      const isEnabled = enabledYakus.has(yakuType);
      const isIncomplete = incompleteYakus.has(yakuType);

      return `
      <div class="yaku-manager-item ${isIncomplete ? 'incomplete' : ''}">
        <label class="yaku-checkbox-label">
          <input type="checkbox" 
                 ${isEnabled ? 'checked' : ''}
                 onchange="toggleYakuRegistration('${yakuType}', this.checked)"
                 ${
                   isIncomplete
                     ? 'title="This yaku has incomplete implementation"'
                     : ''
                 }>
          <span class="yaku-name">${yakuType}</span>
          ${
            isIncomplete
              ? '<span class="incomplete-badge">Incomplete</span>'
              : ''
          }
        </label>
      </div>
    `;
    })
    .join('');

  content.innerHTML = `
    <div class="yaku-manager-header">
      <h3>Yaku Registration Manager</h3>
      <p>Select which yakus should be active during analysis. Incomplete yakus are disabled by default.</p>
    </div>
    <div class="yaku-manager-list">
      ${yakuHTML}
    </div>
    <div class="yaku-manager-footer">
      <p><strong>Enabled:</strong> ${enabledYakus.size} yakus</p>
      <p><strong>Incomplete:</strong> ${
        incompleteYakus.size
      } yakus (${Array.from(incompleteYakus).join(', ')})</p>
    </div>
  `;
}

// Custom yaku caching functions
window.saveCustomYakuCache = function () {
  try {
    const cacheData = customYakuDefinitions.map((yaku) => ({
      yakuType: yaku.yakuType,
      name: yaku.name,
      han: yaku.han,
      requirements: yaku.requirements,
    }));
    localStorage.setItem(CUSTOM_YAKU_CACHE_KEY, JSON.stringify(cacheData));
    alert(`Saved ${cacheData.length} custom yaku to cache!`);
  } catch (error) {
    alert(
      'Failed to save custom yaku cache: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
};

window.loadCustomYakuCache = function () {
  try {
    const cacheData = localStorage.getItem(CUSTOM_YAKU_CACHE_KEY);
    if (!cacheData) {
      alert('No cached custom yaku found');
      return;
    }

    const parsedData = JSON.parse(cacheData);
    if (!Array.isArray(parsedData)) {
      throw new Error('Invalid cache data format');
    }

    // Clear existing and load from cache
    customYakuDefinitions.length = 0;

    parsedData.forEach((yakuData: any) => {
      customYakuDefinitions.push({
        yakuType: yakuData.yakuType,
        name: yakuData.name,
        han: yakuData.han,
        requirements: yakuData.requirements,
      });
    });

    initializeYakuSystem(); // Re-register with cached yakus
    updateCustomYakuDisplay();
    updateYakuBrowserDisplay();
    alert(`Loaded ${parsedData.length} custom yaku from cache!`);
  } catch (error) {
    alert(
      'Failed to load custom yaku cache: ' +
        (error instanceof Error ? error.message : String(error)),
    );
  }
};

window.loadCustomYakuExample = function (exampleType: string) {
  const nameInput = document.getElementById(
    'customYakuName',
  ) as HTMLInputElement;
  const hanInput = document.getElementById('customYakuHan') as HTMLInputElement;
  const definitionInput = document.getElementById(
    'customYakuDefinition',
  ) as HTMLTextAreaElement;

  switch (exampleType) {
    case 'allEven':
      nameInput.value = 'All Even Numbers';
      hanInput.value = '2';
      definitionInput.value = JSON.stringify(
        {
          requires: [
            {
              allowedNumbers: [2, 4, 6, 8],
              allowedSuits: ['MAN', 'PIN', 'SOU'],
            },
          ],
        },
        null,
        2,
      );
      break;

    case 'rainbow':
      nameInput.value = 'Three Suits Required';
      hanInput.value = '2';
      definitionInput.value = JSON.stringify(
        {
          requires: [
            {
              requiredSuits: ['MAN', 'PIN', 'SOU'],
            },
          ],
        },
        null,
        2,
      );
      break;

    case 'lucky7':
      nameInput.value = 'Lucky Seven';
      hanInput.value = '1';
      definitionInput.value = JSON.stringify(
        {
          requires: [
            {
              requiredNumbers: [7],
            },
          ],
        },
        null,
        2,
      );
      break;
  }
};

function updateCustomYakuDisplay() {
  const activeYakuDiv = document.getElementById('activeCustomYaku')!;

  if (customYakuDefinitions.length === 0) {
    activeYakuDiv.innerHTML = '<p>No custom yaku currently registered</p>';
    return;
  }

  const yakuHTML = customYakuDefinitions
    .map(
      (yaku, index) => `
    <div class="custom-yaku-item">
      <h4>${yaku.name} (${yaku.han} han)</h4>
      <p><strong>Yaku Type:</strong> <code>${yaku.yakuType}</code></p>
      <details>
        <summary>View Requirements Definition</summary>
        <pre><code>${JSON.stringify(yaku.requirements, null, 2)}</code></pre>
      </details>
      <div class="yaku-item-actions">
        <button class="btn btn-secondary" onclick="editCustomYaku(${index})">Edit</button>
        <button class="btn btn-danger" onclick="removeCustomYaku(${index})">Remove</button>
      </div>
    </div>
  `,
    )
    .join('');

  activeYakuDiv.innerHTML = yakuHTML;
}

window.removeCustomYaku = function (index: number) {
  if (
    confirm(
      `Are you sure you want to remove "${customYakuDefinitions[index].name}"?`,
    )
  ) {
    customYakuDefinitions.splice(index, 1);
    initializeYakuSystem(); // Re-register without removed yaku
    updateCustomYakuDisplay();
    updateYakuBrowserDisplay();
  }
};

// Edit custom yaku
window.editCustomYaku = function (index: number) {
  const yaku = customYakuDefinitions[index];
  const nameInput = document.getElementById(
    'customYakuName',
  ) as HTMLInputElement;
  const hanInput = document.getElementById('customYakuHan') as HTMLInputElement;
  const definitionInput = document.getElementById(
    'customYakuDefinition',
  ) as HTMLTextAreaElement;

  nameInput.value = yaku.name;
  hanInput.value = yaku.han.toString();
  definitionInput.value = JSON.stringify(yaku.requirements, null, 2);

  // Show edit mode
  const addBtn = document.querySelector('.add-yaku-btn') as HTMLButtonElement;
  const editBtn = document.querySelector('.save-edit-btn') as HTMLButtonElement;
  const cancelBtn = document.querySelector(
    '.cancel-edit-btn',
  ) as HTMLButtonElement;

  if (addBtn) addBtn.style.display = 'none';
  if (editBtn) {
    editBtn.style.display = 'inline-block';
    editBtn.onclick = () => window.saveEditedYaku(index);
  }
  if (cancelBtn) cancelBtn.style.display = 'inline-block';

  // Scroll to form
  document
    .getElementById('customYakuName')
    ?.scrollIntoView({ behavior: 'smooth' });
};

// Save edited yaku
window.saveEditedYaku = function (index: number) {
  const nameInput = document.getElementById(
    'customYakuName',
  ) as HTMLInputElement;
  const hanInput = document.getElementById('customYakuHan') as HTMLInputElement;
  const definitionInput = document.getElementById(
    'customYakuDefinition',
  ) as HTMLTextAreaElement;

  const name = nameInput.value.trim();
  const han = parseInt(hanInput.value);
  const definitionText = definitionInput.value.trim();

  if (!name || !han || !definitionText) {
    alert('Please fill in all fields');
    return;
  }

  if (han < 1 || han > 13) {
    alert('Han value must be between 1-13');
    return;
  }

  try {
    const requirements = JSON.parse(definitionText);

    // Validate requirements
    if (typeof requirements !== 'object' || requirements === null) {
      alert(
        'Requirements must be a valid object with yaku definition properties.',
      );
      return;
    }

    customYakuDefinitions[index] = {
      yakuType: customYakuDefinitions[index].yakuType, // Keep original yakuType
      name,
      han,
      requirements,
    };

    initializeYakuSystem(); // Re-register with updated yaku
    updateCustomYakuDisplay();
    updateYakuBrowserDisplay();
    window.cancelEditYaku();
    alert(`Custom yaku "${name}" updated successfully!`);
  } catch (error) {
    alert(
      `Definition error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};

// Cancel editing
window.cancelEditYaku = function () {
  const nameInput = document.getElementById(
    'customYakuName',
  ) as HTMLInputElement;
  const hanInput = document.getElementById('customYakuHan') as HTMLInputElement;
  const definitionInput = document.getElementById(
    'customYakuDefinition',
  ) as HTMLTextAreaElement;

  nameInput.value = '';
  hanInput.value = '';
  definitionInput.value = '';

  // Hide edit mode
  const addBtn = document.querySelector('.add-yaku-btn') as HTMLButtonElement;
  const editBtn = document.querySelector('.save-edit-btn') as HTMLButtonElement;
  const cancelBtn = document.querySelector(
    '.cancel-edit-btn',
  ) as HTMLButtonElement;

  if (addBtn) addBtn.style.display = 'inline-block';
  if (editBtn) editBtn.style.display = 'none';
  if (cancelBtn) cancelBtn.style.display = 'none';
};

// Show yaku library
window.showYakuLibrary = function () {
  const libraryDiv = document.getElementById('yakuLibraryModal');
  if (libraryDiv) {
    libraryDiv.style.display = 'block';
    updateYakuLibraryDisplay();
  }
};

// Select from library
window.selectFromLibrary = function (yakuId: string) {
  const yaku = yakuLibrary[yakuId as keyof typeof yakuLibrary];
  if (yaku) {
    const nameInput = document.getElementById(
      'customYakuName',
    ) as HTMLInputElement;
    const hanInput = document.getElementById(
      'customYakuHan',
    ) as HTMLInputElement;
    const definitionInput = document.getElementById(
      'customYakuDefinition',
    ) as HTMLTextAreaElement;

    nameInput.value = yaku.name;
    hanInput.value = yaku.han.toString();
    definitionInput.value = JSON.stringify(yaku.definition, null, 2);

    // Close library modal
    const libraryDiv = document.getElementById('yakuLibraryModal');
    if (libraryDiv) libraryDiv.style.display = 'none';

    // Scroll to form
    document
      .getElementById('customYakuName')
      ?.scrollIntoView({ behavior: 'smooth' });
  }
};

// Update yaku library display
function updateYakuLibraryDisplay() {
  const libraryContent = document.getElementById('yakuLibraryContent');
  if (!libraryContent) return;

  const libraryHTML = Object.entries(yakuLibrary)
    .map(
      ([id, yaku]) => `
    <div class="library-yaku-item">
      <h4>${yaku.name} (${yaku.han} han)</h4>
      <p>${yaku.description}</p>
      <div class="library-item-actions">
        <button class="btn btn-success" onclick="selectFromLibrary('${id}')">Select This Yaku</button>
        <button class="btn btn-secondary" onclick="loadSpecificExample('${
          yaku.testHand
        }'); showTab('analyzer')">Test Example</button>
      </div>
      <details>
        <summary>View JSON Definition</summary>
        <pre><code>${JSON.stringify(yaku.definition, null, 2)}</code></pre>
      </details>
    </div>
  `,
    )
    .join('');

  libraryContent.innerHTML = libraryHTML;
}

// Tour functions
window.startCustomYakuTour = function () {
  tourState.active = true;
  tourState.currentStep = 0;
  showTourStep();
};

window.nextTourStep = function () {
  tourState.currentStep++;
  if (tourState.currentStep >= tourState.steps.length) {
    window.skipTour();
    return;
  }
  showTourStep();
};

window.skipTour = function () {
  tourState.active = false;
  const tourOverlay = document.getElementById('tourOverlay');
  if (tourOverlay) tourOverlay.style.display = 'none';
};

function showTourStep() {
  const step = tourState.steps[tourState.currentStep];
  const tourOverlay = document.getElementById('tourOverlay');
  const tourContent = document.getElementById('tourContent');

  if (tourOverlay && tourContent) {
    tourOverlay.style.display = 'block';
    tourContent.innerHTML = `
      <div class="tour-step">
        <h3>${step.title}</h3>
        <p>${step.content}</p>
        <div class="tour-progress">
          Step ${tourState.currentStep + 1} of ${tourState.steps.length}
        </div>
        <div class="tour-actions">
          <button class="btn btn-secondary" onclick="skipTour()">Skip Tour</button>
          <button class="btn btn-success" onclick="nextTourStep()">${
            tourState.currentStep === tourState.steps.length - 1
              ? 'Finish'
              : 'Next'
          }</button>
        </div>
      </div>
    `;

    // Highlight target element
    const targetElement = document.querySelector(step.target);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('tour-highlight');

      // Remove highlight after a delay
      setTimeout(() => {
        targetElement.classList.remove('tour-highlight');
      }, 3000);
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Mahjong Library Demo initialized');

  // Initialize yaku system
  initializeYakuSystem();
  console.log(
    `Initialized yaku system with ${enabledYakus.size} enabled yakus`,
  );
  console.log(
    `Disabled incomplete yakus: ${Array.from(incompleteYakus).join(', ')}`,
  );

  // Initialize custom yaku display
  updateCustomYakuDisplay();

  // Try to load cached custom yaku if available
  const cacheData = localStorage.getItem(CUSTOM_YAKU_CACHE_KEY);
  if (cacheData) {
    console.log('Found cached custom yaku, auto-loading...');
    window.loadCustomYakuCache();
  }

  console.log('Ready for user interaction');
});
