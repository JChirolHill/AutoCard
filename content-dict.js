// Setup modal for new words
setupModal();

// Setup button for adding new cards
let btn = document.createElement('button');
btn.classList.add('btn-ac');
btn.setAttribute('data-open', 'ac-modal');
btn.innerText = 'Auto Card';

// Setup open modal button handler
btn.addEventListener('click', () => {
    // Gather card info
    let card = {
        cn: document.querySelector('.h_word').innerText,
        py: parseTonesToNumbers(document.querySelector('._entry_pinyin').innerText),
        en: document.querySelector('.cn').innerText.replace(/\[.*\]\s/, ''),
        hsk: document.querySelector('.ico_hsk') ? parseHSKLevel(document.querySelector('.ico_hsk').innerText) : ''
    }
    autofillModal(card);

    // Open up modal for info validation
    document.getElementById(btn.dataset.open).classList.add('is-visible');
}, false);

document.querySelector('.container_wrap').appendChild(btn);
