const TIME_BETWEEN_INTERVALS = 500; // milliseconds
const LOAD_TIMEOUT = 15 * 1000; // Stop interval after this time (ms) if page takes too long to load
const sentences = [];

// Wait until Chinese text loads on page before attaching event listeners
let numLoadsLeft = LOAD_TIMEOUT / TIME_BETWEEN_INTERVALS;
const pageLoadInterval = setInterval(() => {
    // Clear interval if reached the max number of checks or content loaded
    if (numLoadsLeft === 0) {
        clearInterval(pageLoadInterval);
        return;
    }

    if (document.querySelector('.tooltip')) {
        clearInterval(pageLoadInterval);
        setupModal();
        processHskText();
        return;
    }

    numLoadsLeft--;
}, 500);

function processHskText() {
    let tempSentence = '';

    document.querySelector('.main-content').childNodes.forEach((paragraph) => {
        paragraph.childNodes.forEach((term) => {
            // Keep track of all sentences and add data attribute with sentence index to each term
            if (isSentenceEnd(term.innerText)) {
                if (tempSentence) { // Empty temp sentence means to sentence end markers in a row, ignore
                    sentences.push(tempSentence);
                    tempSentence = '';
                }
            }
            else {
                // Add data attribute for sentence index
                tempSentence += term.innerText;
                term.dataset.sentenceId = sentences.length;
            }

            // Add onclick handler to create flashcard on every hsk-highlighted term
            if (term.classList.contains('tooltip')) {
                term.addEventListener('click', () => {
                    // Extract all relevant pieces to make card
                    const cardInfoArr = term.childNodes[1].innerHTML.split('<br>');
                    const card = {
                        cn: cardInfoArr[0],
                        py: parseTonesToNumbers(cardInfoArr[1], true),
                        en: cardInfoArr[2],
                        hsk: parseHSKLevel(cardInfoArr[3]),
                        cns: sentences[term.dataset.sentenceId],
                        ens: ''
                    };

                    autofillModal(card);

                    document.querySelector('#ac-modal').classList.add('is-visible');
                    console.log(card);
                });
            }
        });
    });

    // Make sure no trailing sentence at the end of text without sentence end marker
    if (tempSentence) {
        sentences.push(tempSentence);
    }
}
