document.addEventListener('DOMContentLoaded', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        // Using wrong dictionary, show redirect to correct dictionary
        if (tabs[0].url.search(/https:\/\/dict\.naver\.com\/linedict\/enzhdict\/#\/encn.*/) < 0) { // Valid url
            // Show html for valid url
            document.querySelector('#content').innerHTML = document.getElementById('template-correct-url').innerHTML;

            // Update total words display whenever add word
            chrome.runtime.sendMessage({ type: 'get-cards' }, (cards) => {
                // Append card to list
                let template = Handlebars.compile(document.querySelector('#template-card').innerHTML);
                if (cards && cards.length > 0) {
                    cards.forEach((card, index) => {
                        document.querySelector('#list-cards').innerHTML += template({
                            cn: card.cn,
                            en: card.en,
                            py: card.py,
                            hsk: card.hsk,
                            index: index
                        });
                    });
                }

                // Update number of cards
                document.querySelector('#num-cards').innerText = `${cards.length} word${cards.length == 1 ? '' : 's'}`;
            });

            // Export button handler into txt format
            document.querySelector('#btn-export').addEventListener('click', function() {
                if (document.querySelector('#list-cards').children.length > 0) {
                    chrome.runtime.sendMessage({ type: 'get-export' });
                }
                else {
                    document.querySelector('#error-text').innerText = 'Nothing to export';
                    setTimeout(() => {
                        document.querySelector('#error-text').innerText = '';
                    }, 3000);
                }
            }, false);

            // Clear button handler
            document.querySelector('#btn-clear').addEventListener('click', () => {
                if (document.querySelector('#num-cards').innerText !== '0 words') {
                    if (confirm('Are you sure you want to permanently clear all words?')) {
                        // Clear current display
                        document.querySelector('#list-cards').innerHTML = '';
                        document.querySelector('#num-cards').innerText = '0 words';

                        // Clear data model
                        chrome.runtime.sendMessage({ type: 'clear' });
                    }
                }
                else {
                    document.querySelector('#error-text').innerText = 'Nothing to clear';
                    setTimeout(() => {
                        document.querySelector('#error-text').innerText = '';
                    }, 3000);
                }
            }, false);

            // Edit/delete card handler
            document.querySelector('.container').addEventListener('click' , function(event) {
                if (event.target.tagName.toLowerCase() === 'i') {
                    if (confirm('Are you sure you want to delete this word?')) {
                        chrome.runtime.sendMessage({ type: event.target.dataset.op, index: event.target.dataset.index }, (error) => {
                            if (error === null) {
                                window.location.href = 'popup.html';
                            }
                        });
                    }
                }
            });
        }
        else { // Invalid url
            // Show HTML for invalid url
            document.querySelector('#content').innerHTML = document.getElementById('template-wrong-url').innerHTML;

            // Hyperlink to correct dictionary handler
            document.querySelector('small a').addEventListener('click', function() {
                chrome.tabs.update({url: this.href});
                return false;
            });
        }
    });
}, false);
