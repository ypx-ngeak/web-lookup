let deferredPrompt;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-btn').style.display = 'block';
});

document.getElementById('install-btn').addEventListener('click', () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        deferredPrompt = null;
        document.getElementById('install-btn').style.display = 'none';
      }
    });
  }
});

function getAllTranslations() {
  const allTranslations = [];
  Object.values(translationData).forEach(category => {
    category.forEach(item => {
      allTranslations.push(item);
    });
  });
  return allTranslations;
}

function translateText(inputText) {
  const input = inputText.toLowerCase().trim();
  const allTranslations = getAllTranslations();

  for (const item of allTranslations) {
    for (const ngeakishVariant of item.ngeakish) {
      if (ngeakishVariant.toLowerCase() === input) {
        return item.english;
      }
    }
  }

  return null;
}


function searchTranslations(query) {
  if (!query) return getAllTranslations();

  const lowerQuery = query.toLowerCase();
  const allTranslations = getAllTranslations();

  return allTranslations.filter(item => {
    const matchesNgeakish = item.ngeakish.some(variant =>
      variant.toLowerCase().includes(lowerQuery)
    );
    const matchesEnglish = item.english.toLowerCase().includes(lowerQuery);
    return matchesNgeakish || matchesEnglish;
  });
}

function renderLookupTable(results) {
  const lookupResults = document.getElementById('lookup-results');

  if (results.length === 0) {
    lookupResults.innerHTML = '<p class="no-results">No translations found</p>';
    return;
  }

  const html = results.map(item => `
    <div class="lookup-item">
      <div class="ngeakish-variants">
        ${item.ngeakish.map(variant => `<span class="variant">${variant}</span>`).join('')}
      </div>
      <div class="arrow">→</div>
      <div class="english-translation">${item.english}</div>
    </div>
  `).join('');

  lookupResults.innerHTML = html;
}

document.getElementById('search-input').addEventListener('input', (e) => {
  const results = searchTranslations(e.target.value);
  renderLookupTable(results);
});

renderLookupTable(getAllTranslations());
