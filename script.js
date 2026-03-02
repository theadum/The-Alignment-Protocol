const gameState = {
  knowledge: 0,
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
  generators: {
    labNotes: 0,
    graduateAssistants: 0,
    computeClusters: 0,
  },
  buyables: {
    labNotes: {
      baseCost: 100,
      costMultiplier: 1.1,
      unlockWhen: () => true,
    },
    graduateAssistants: {
      baseCost: 10_000,
      costMultiplier: 1.1,
      unlockWhen: () => gameState.generators.labNotes >= 10,
    },
    computeClusters: {
      baseCost: 1_000_000,
      costMultiplier: 1.1,
      unlockWhen: () => gameState.generators.graduateAssistants >= 10,
    },
  },
};

const elements = {
  knowledgeValue: document.getElementById('knowledgeValue'),
  knowledgePerSecond: document.getElementById('knowledgePerSecond'),
  generatorChain: document.getElementById('generatorChain'),
  timePlayedRun: document.getElementById('timePlayedRun'),
  timeSincePrestige: document.getElementById('timeSincePrestige'),
  totalTimePlayed: document.getElementById('totalTimePlayed'),
  totalKnowledgeEarned: document.getElementById('totalKnowledgeEarned'),
  totalPrestiges: document.getElementById('totalPrestiges'),
  buyables: [...document.querySelectorAll('.buyable')],
};

function getBuyableCost(id) {
  const buyable = gameState.buyables[id];
  return Math.floor(buyable.baseCost * buyable.costMultiplier ** gameState.generators[id]);
}

function getKnowledgePerSecond() {
  return gameState.generators.labNotes;
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
    const unlocked = gameState.buyables[id].unlockWhen();
    const cost = getBuyableCost(id);
    const button = buyableEl.querySelector('.buy-button');

    buyableEl.classList.toggle('locked', !unlocked);
    buyableEl.querySelector('.owned-count').textContent = formatNumber(gameState.generators[id]);
    buyableEl.querySelector('.cost').textContent = formatNumber(cost);
    button.disabled = !unlocked || gameState.knowledge < cost;
  });
}

function refreshStatsUI() {
  elements.knowledgeValue.textContent = formatNumber(gameState.knowledge);
  elements.knowledgePerSecond.textContent = `+${formatNumber(getKnowledgePerSecond())} / second`;
  elements.generatorChain.textContent = `Lab Notes: ${formatNumber(
    gameState.generators.labNotes
  )} | Graduate Assistants: ${formatNumber(
    gameState.generators.graduateAssistants
  )} | Compute Clusters: ${formatNumber(gameState.generators.computeClusters)}`;

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

function buy(id) {
  const cost = getBuyableCost(id);

  if (!gameState.buyables[id].unlockWhen() || gameState.knowledge < cost) {
    return;
  }

  gameState.knowledge -= cost;
  gameState.generators[id] += 1;

  refreshBuyableUI();
  refreshStatsUI();
}

elements.buyables.forEach((buyableEl) => {
  buyableEl.querySelector('.buy-button').addEventListener('click', () => {
    buy(buyableEl.dataset.upgradeId);
  });
});

let previousTickMs = performance.now();

function gameLoop(nowMs) {
  const deltaSeconds = (nowMs - previousTickMs) / 1000;
  previousTickMs = nowMs;

  const knowledgeGain = gameState.generators.labNotes * deltaSeconds;
  const labNotesGain = gameState.generators.graduateAssistants * deltaSeconds;
  const graduateGain = gameState.generators.computeClusters * deltaSeconds;

  gameState.knowledge += knowledgeGain;
  gameState.generators.labNotes += labNotesGain;
  gameState.generators.graduateAssistants += graduateGain;

  gameState.run.knowledgeEarned += knowledgeGain;
  gameState.run.timePlayedSeconds += deltaSeconds;

  gameState.lifetime.totalKnowledgeEarned += knowledgeGain;
  gameState.lifetime.totalTimePlayedSeconds += deltaSeconds;
  gameState.lifetime.totalTimeSincePrestigeSeconds += deltaSeconds;

  refreshBuyableUI();
  refreshStatsUI();

  window.requestAnimationFrame(gameLoop);
}

refreshBuyableUI();
refreshStatsUI();
window.requestAnimationFrame(gameLoop);
