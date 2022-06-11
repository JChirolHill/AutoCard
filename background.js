chrome.storage.local.get({autocard_cards: []}, function(response) {
    updateBadge(response.autocard_cards.length);
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'add-card') {
        // Check card not already created
        chrome.storage.local.get({autocard_cards: []}, function(response) {
            let cards = response.autocard_cards;
            let duplicate = false;
            cards.forEach((card) => {
                if (card.cn === request.card.cn) {
                    sendResponse({ error: 'This card already exists' });
                    duplicate = true;
                    return;
                }
            });

            // Storing new card
            if (!duplicate) {
                // Add to card array
                cards.push({
                    cn: request.card.cn,
                    en: request.card.en,
                    py: request.card.py,
                    hsk: request.card.hsk,
                    clozeIndex: -1
                });
                chrome.storage.local.set({autocard_cards: cards});

                chrome.storage.local.get({autocard_clozes: []}, function(response) {
                    let clozes = response.autocard_clozes;
                    let indexCloze = -1;
                    // Check if exists in cloze array
                    clozes.forEach((cloze, index) => {
                        if (cloze.cnsOrig === request.card.cns) {
                            indexCloze = index;
                            return;
                        }
                    });

                    // Add to cloze array
                    if (indexCloze == -1) { // Add new cloze sentence
                        clozes.push({
                            cnsOrig: request.card.cns,
                            cns: insertClozeDel(request.card.cn, request.card.cns, 1),
                            ens: request.card.ens,
                            img: request.card.img,
                            nextCloze: 2
                        });
                        indexCloze = clozes.length - 1;
                    }
                    else { // Add to existing cloze sentence
                        let clozed = insertClozeDel(request.card.cn, clozes[indexCloze].cns, clozes[indexCloze].nextCloze);
                        clozes[indexCloze].nextCloze++;
                        clozes[indexCloze].cns = clozed;
                    }

                    chrome.storage.local.set({autocard_clozes: clozes});

                    // Update mapping between cards and clozes
                    cards[cards.length - 1].clozeIndex = indexCloze;
                    chrome.storage.local.set({autocard_cards: cards});

                    sendResponse({ error: null });

                    updateBadge(cards.length);
                });
            }
        });

        return true; // To keep port open
    }
    else if (request.type === 'get-cards') {
        chrome.storage.local.get({autocard_cards: []}, function(response) {
            sendResponse(response.autocard_cards);
        });

        return true; // To keep port open
    }
    else if (request.type === 'get-export') {
        // Format cards and clozes into final export blob
        let exportLines = [];
        chrome.storage.local.get({autocard_cards: []}, function(response) {
            let cards = response.autocard_cards;
            chrome.storage.local.get({autocard_clozes: []}, function(response) {
                let clozes = response.autocard_clozes;
                cards.forEach((card) => {
                    let temp = '';

                    // Add card info
                    temp += `${card.cn}\t`;
                    temp += `${card.en}\t`;
                    temp += `${card.py}\t`;
                    temp += `${(card.hsk ? 'HSK' : '') + card.hsk}\n`;

                    // Add cloze info
                    temp += `${clozes[card.clozeIndex].cns}\t`;
                    temp += `${clozes[card.clozeIndex].ens}\t`;
                    temp += `${clozes[card.clozeIndex].img ? clozes[card.clozeIndex].img : 'NA'}\t\n`;

                    exportLines.push(temp);
                });

                // Download file
                let blob = new Blob(exportLines, {type: "text/plain;charset=utf-8"});
                window.saveAs(blob, "AutoCard.txt");
            });
        });

        return true; // To keep port open
    }
    else if (request.type === 'clear') {
        chrome.storage.local.set({autocard_cards: []});
        chrome.storage.local.set({autocard_clozes: []});
        updateBadge(null);
    }
    else if (request.type === 'edit') {
        // Update card

        // Update related cloze

        sendResponse(null);
    }
    else if (request.type === 'delete') {
        chrome.storage.local.get({autocard_cards: []}, function(response) {
            let cards = response.autocard_cards;
            cards.splice(request.index, 1);
            chrome.storage.local.set({autocard_cards: cards});

            updateBadge(cards.length);
        });

        sendResponse(null);
    }
});

// Inserts cloze deletion based on word
function insertClozeDel(word, sentence, indexCloze) {
    return sentence.replace(word, `{{c${indexCloze}::${word}}}`);
}

function updateBadge(numCards) {
    chrome.browserAction.setBadgeText({ text: (numCards > 0 ? String(numCards) : null) });
    chrome.browserAction.setBadgeBackgroundColor({ color: '#cc0000' });
}
