// Parses out a string of the form 'HSK1' or 'HSK 1' and parses out just the number
function parseHSKLevel(hskStr) {
    return hskStr.replace('HSK', '').replace(' ', '');
}

// Takes a string of pinyin (separated by spaces or not) and parses out the tones to numbers
function parseTonesToNumbers(pinyinStr, isPinyinSeparated = false) {
    const toneMap = {
        'ā': 'a1',
        'á': 'a2',
        'ǎ': 'a3',
        'à': 'a4',
        'ē': 'e1',
        'é': 'e2',
        'ě': 'e3',
        'è': 'e4',
        'ī': 'i1',
        'í': 'i2',
        'ǐ': 'i3',
        'ì': 'i4',
        'ō': 'o1',
        'ó': 'o2',
        'ǒ': 'o3',
        'ò': 'o4',
        'ū': 'u1',
        'ú': 'u2',
        'ǔ': 'u3',
        'ù': 'u4',
        'ǚ': 'v3',
        'ǜ': 'v4',
        'ü': 'v5'
    };

    // Add spaces to pinyin string
    let pinyinArr = (isPinyinSeparated ? pinyinStr.split(' ') : pinyinSeparate(pinyinStr));

    // Replace tones with letters and numbers
    let pinyinNumberStr = '';
    let toneNum = 0;
    pinyinArr.forEach((pinyinWord, index) => {
        for (let i = 0; i < pinyinWord.length; i++) {
            let letter = pinyinWord[i];

            if (toneNum === 0 && toneMap[letter]) { // Replace tone with letter and number
                toneNum = toneMap[letter][1];
                pinyinNumberStr += toneMap[letter][0];
            }
            else {
                pinyinNumberStr += letter;
            }
        }

        // If no tone found, neutral; if not last pinyin word, add space
        pinyinNumberStr += ((toneNum === 0 ? '5' : toneNum) + (index === pinyinArr.length - 1 ? '' : ' '));
        toneNum = 0;
    });

    return pinyinNumberStr;
}

// Determines if a character is a sentence end marker
function isSentenceEnd(character) {
    return character.match(/(。|！|？|\n|…)/g);
}

function setupModal() {
    // Add modal
    let modalInstr = document.createElement('h2');
    modalInstr.innerText = 'Add Card';

    let modalClose = document.createElement('button');
    modalClose.classList.add('btn-ac');
    modalClose.setAttribute('aria-label', 'close modal');
    modalClose.setAttribute('data-close', true);
    modalClose.innerHTML = '&times;';

    let modalHeader = document.createElement('header');
    modalHeader.classList.add('modal-header');
    modalHeader.appendChild(modalInstr);
    modalHeader.appendChild(modalClose);

    let modalForm = document.createElement('form');

    let modalContent = document.createElement('section');
    modalContent.classList.add('modal-content');
    modalContent.appendChild(modalForm);

    let modalError = document.createElement('h5');
    modalError.classList.add('modal-error');

    let modalSave = document.createElement('button');
    modalSave.id = 'modal-save';
    modalSave.classList.add('btn-ac');
    modalSave.setAttribute('type', 'submit');
    modalSave.innerText = 'Save Card';

    let modalFooter = document.createElement('footer');
    modalFooter.classList.add('modal-footer');
    modalFooter.appendChild(modalSave);

    let modalDialog = document.createElement('div');
    modalDialog.classList.add('modal-dialog');
    modalDialog.appendChild(modalHeader);
    modalDialog.appendChild(modalContent);

    let modal = document.createElement('div');
    modal.id = 'ac-modal';
    modal.classList.add('modal');
    modal.appendChild(modalDialog);
    document.querySelector('body').append(modal);

    // Card constants
    const modalLabels = [
        { id: 'cn', label: 'Chinese' },
        { id: 'en', label: 'English' },
        { id: 'py', label: 'Pinyin' },
        { id: 'hsk', label: 'HSK Level' },
        { id: 'cns', label: 'Chinese Sentence' },
        { id: 'ens', label: 'English Sentence' },
        { id: 'img', label: 'Image Reference'}
    ];
    const card = {};
    let prevCNS = '';
    let prevENS = '';
    let prevImg = '';

    // Add all the card fields to modal
    modalLabels.forEach((label) => {
        let HTMLlabel = document.createElement('label');
        HTMLlabel.setAttribute('for', `modal-form-${label.id}`);
        HTMLlabel.innerText = label.label;

        let HTMLinput = document.createElement('input');
        HTMLinput.id = `modal-form-${label.id}`;
        HTMLinput.classList.add('card-input');

        // Add star for required fields
        if (label.id !== 'hsk' && label.id !== 'img') {
            HTMLinput.required = true;
            HTMLlabel.innerHTML += '<span class="text-ac">*</span>';
        }

        let labelDiv = document.createElement('div');
        labelDiv.appendChild(HTMLlabel);

        // Add toggle for use previous sentence
        if (label.id === 'cns') {
            addToggle(prevImg, labelDiv, 'slider-prev-sent');
        }

        // Add toggle for use previous image ref
        if (label.id === 'img') {
            addToggle(prevImg, labelDiv, 'slider-prev-img');
        }

        labelDiv.appendChild(HTMLinput);
        modalForm.appendChild(labelDiv);
    });

    modalForm.appendChild(modalError);
    modalForm.appendChild(modalFooter);



    // Add listener for change to checkbox prev sentence
    document.querySelector('#slider-prev-sent').addEventListener('change', (event) => {
        if (event.target.checked) {
            document.querySelector('#modal-form-cns').value = prevCNS;
            document.querySelector('#modal-form-ens').value = prevENS;
            document.querySelector('#modal-form-img').value = prevImg;
            document.querySelector('#slider-prev-img').checked = true;
        }
        else {
            document.querySelector('#modal-form-cns').value = '';
            document.querySelector('#modal-form-ens').value = '';
            document.querySelector('#modal-form-img').value = '';
            document.querySelector('#slider-prev-img').checked = false;
        }
    });

    // Add listener for change to checkbox prev img
    document.querySelector('#slider-prev-img').addEventListener('change', (event) => {
        if (event.target.checked) {
            document.querySelector('#modal-form-img').value = prevImg;
        }
        else {
            document.querySelector('#modal-form-img').value = '';
        }
    });

    // Modal save handler
    modalForm.addEventListener('submit', (event) => {
        event.preventDefault();

        // Fill all fields from form
        document.querySelectorAll('.card-input').forEach((input, index) => {
            card[input.id.match(/(?<=-)[a-zA-Z0-9]{2,3}$/)] = input.value;
        });

        // Check that sentence contains word
        if (!card.cns.includes(card.cn)) {
            modalError.innerText = `Chinese sentence does not contain "${card.cn}"`;
        }
        else { // Send, all ok
            chrome.runtime.sendMessage({ type: 'add-card', card }, (response) => {
                if (response.error) {
                    modalError.innerText = response.error;
                }
                else {
                    modalClose.click();
                    prevCNS = card.cns;
                    prevENS = card.ens;
                    prevImg = card.img;
                    document.querySelectorAll('.modal [type=checkbox]').forEach((checkbox) => {
                        checkbox.checked = false;
                        checkbox.disabled = false;
                    });
                    document.querySelectorAll('.card-input').forEach((input) => {
                        input.value = '';
                    });
                }
            });
        }
    });

    // Close modal button handler
    document.querySelector('[data-close]').addEventListener('click', () => {
        document.querySelector('#ac-modal').classList.remove('is-visible');
    });

    // Close modal click outside of modal handler
    document.addEventListener('mousedown', e => {
        if (e.target == document.querySelector(".modal.is-visible")) {
            document.querySelector(".modal.is-visible").classList.remove('is-visible');
        }
    });
}


function addToggle(prevImg, appendTo, idSlider) {
    let divToggle = document.createElement('div');
    divToggle.classList.add('switch-container');
    let labelToggle = document.createElement('label');
    labelToggle.classList.add('switch');
    let inputToggle = document.createElement('input');
    inputToggle.id = idSlider;
    inputToggle.type = 'checkbox';
    inputToggle.disabled = true;
    inputToggle.checked = prevImg ? true : false;
    inputToggle.value = prevImg;
    let spanToggle = document.createElement('span');
    spanToggle.classList.add('slider');
    let spanInstrToggle = document.createElement('span');
    spanInstrToggle.innerText = 'Same as previous?';

    labelToggle.appendChild(inputToggle);
    labelToggle.appendChild(spanToggle);
    divToggle.appendChild(labelToggle);
    divToggle.appendChild(spanInstrToggle);
    appendTo.appendChild(divToggle);
}

// Autofill modal with whatever card info present, clear any previous errors on modal
function autofillModal(card) {
    if (card.cn) {
        document.querySelector('#modal-form-cn').value = card.cn;
    }

    if (card.py) {
        document.querySelector('#modal-form-py').value = card.py;
    }

    if (card.en) {
        document.querySelector('#modal-form-en').value = card.en;
    }

    if (card.hsk) {
        document.querySelector('#modal-form-hsk').value = card.hsk;
    }

    if (card.cns) {
        document.querySelector('#modal-form-cns').value = card.cns;
    }

    if (card.ens) {
        document.querySelector('#modal-form-ens').value = card.ens;
    }

    if (card.img) {
        document.querySelector('#modal-form-img').value = card.img;
    }

    // Reset any errors
    document.querySelector('.modal-error').innerText = '';
}
