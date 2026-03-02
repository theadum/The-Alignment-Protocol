const gameState = {
  knowledge: 0,
  baseKnowledgePerSecond: 1,
  run: {
    timePlayedSeconds: 0,
    knowledgeEarned: 0,
  },
  lifetime: {
    totalTimePlayedSeconds: 0,
    totalKnowledgeEarned: 0,
    totalPrestiges: 0,
    totalTimeSincePrestigeSeconds: 0,
  },
  upgrades: {
    labNotes: {
      name: 'Lab Notes',
      owned: 0,
      baseCost: 10,
      costMultiplier: 1.18,
      gainPerSecond: 1,
    },
    graduateAssistants: {
      name: 'Graduate Assistants',
      owned: 0,
      baseCost: 75,
      costMultiplier: 1.22,
      gainPerSecond: 5,
    },
    computeCluster: {
      name: 'Compute Cluster',
      owned: 0,
      baseCost: 400,
      costMultiplier: 1.28,
      gainPerSecond: 20,
    },
  },
};

const elements = {
  knowledgeValue: document.getElementById('knowledgeValue'),
  knowledgePerSecond: document.getElementById('knowledgePerSecond'),
  timePlayedRun: document.getElementById('timePlayedRun'),
  timeSincePrestige: document.getElementById('timeSincePrestige'),
  totalTimePlayed: document.getElementById('totalTimePlayed'),
  totalKnowledgeEarned: document.getElementById('totalKnowledgeEarned'),
  totalPrestiges: document.getElementById('totalPrestiges'),
  buyables: [...document.querySelectorAll('.buyable')],
};

function getUpgradeCost(upgrade) {
  return Math.floor(upgrade.baseCost * upgrade.costMultiplier ** upgrade.owned);
}

function getKnowledgePerSecond() {
  const fromUpgrades = Object.values(gameState.upgrades).reduce(
    (sum, upgrade) => sum + upgrade.owned * upgrade.gainPerSecond,
    0
  );

  return gameState.baseKnowledgePerSecond + fromUpgrades;
}

function formatNumber(value) {
  return Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

function formatTime(seconds) {
  return `${seconds.toFixed(1)}s`;
}

function refreshBuyableUI() {
  elements.buyables.forEach((buyableEl) => {
    const id = buyableEl.dataset.upgradeId;
    const upgrade = gameState.upgrades[id];
    const cost = getUpgradeCost(upgrade);
    const button = buyableEl.querySelector('.buy-button');

    buyableEl.querySelector('.owned-count').textContent = `${upgrade.owned}`;
    buyableEl.querySelector('.cost').textContent = `${formatNumber(cost)}`;
    button.disabled = gameState.knowledge < cost;
  });
}

function refreshStatsUI() {
  elements.knowledgeValue.textContent = formatNumber(gameState.knowledge);
  elements.knowledgePerSecond.textContent = `+${formatNumber(getKnowledgePerSecond())} / second`;

  elements.timePlayedRun.textContent = formatTime(gameState.run.timePlayedSeconds);
  elements.timeSincePrestige.textContent = formatTime(
    gameState.lifetime.totalTimeSincePrestigeSeconds
  );
  elements.totalTimePlayed.textContent = formatTime(gameState.lifetime.totalTimePlayedSeconds);
  elements.totalKnowledgeEarned.textContent = formatNumber(
    gameState.lifetime.totalKnowledgeEarned
  );
  elements.totalPrestiges.textContent = `${gameState.lifetime.totalPrestiges}`;
}

function buyUpgrade(upgradeId) {
  const upgrade = gameState.upgrades[upgradeId];
  const cost = getUpgradeCost(upgrade);

  if (gameState.knowledge < cost) {
    return;
  }

  gameState.knowledge -= cost;
  upgrade.owned += 1;

  refreshBuyableUI();
  refreshStatsUI();
}

elements.buyables.forEach((buyableEl) => {
  buyableEl.querySelector('.buy-button').addEventListener('click', () => {
    buyUpgrade(buyableEl.dataset.upgradeId);
  });
});

let previousTickMs = performance.now();

function gameLoop(nowMs) {
  const deltaSeconds = (nowMs - previousTickMs) / 1000;
  previousTickMs = nowMs;

  const gain = getKnowledgePerSecond() * deltaSeconds;
  gameState.knowledge += gain;
  gameState.run.knowledgeEarned += gain;
  gameState.run.timePlayedSeconds += deltaSeconds;

  gameState.lifetime.totalKnowledgeEarned += gain;
  gameState.lifetime.totalTimePlayedSeconds += deltaSeconds;
  gameState.lifetime.totalTimeSincePrestigeSeconds += deltaSeconds;

  refreshBuyableUI();
  refreshStatsUI();

  window.requestAnimationFrame(gameLoop);
}

refreshBuyableUI();
refreshStatsUI();
window.requestAnimationFrame(gameLoop);
