let nodes = [];
let names = [];
let selectedNames = [];
let allCertificateNums = [];

let table = document.querySelector('div.names > table');
let header = document.querySelector('header');
let optButtons = document.querySelector('.optButtons');
let delSelectedItemsButton = optButtons.querySelector('.del');
let cancelSelectedItemsButton = optButtons.querySelector('.cancel');
let editSelectedItemsButton = optButtons.querySelector('.edit');

cancelSelectedItemsButton.addEventListener('click', () => {
    if(delItemsArr.length > 0) {
        for(let i = 0; i < delItemsArr.length; i++) {
            nodes[delItemsArr[i]].querySelector('input').checked = false;
        }
        delItemsArr = [];
        optButtons.style.visibility = 'hidden';
    }
    selectedNames = [];
});
editSelectedItemsButton.addEventListener('click', function(e) {

    let ind = delItemsArr[0];
    openEditWindow(nodes[ind], ind);
    
});
delSelectedItemsButton.addEventListener('click', () => {
    let items = table.querySelectorAll('tr');
    let indexNode = 0;
    
    for(let i = 0; i < delItemsArr.length; i++) {
        let index = delItemsArr[i];
        let name = items[index].querySelectorAll('td')[4].innerText;
        items[index].parentNode.removeChild(items[index]);
        indexNode = nodes.findIndex(node => node === items[index]);
        nodes.splice(indexNode, 1);

        let namesIndex = names.findIndex(n => n.name === name);
        names.splice(namesIndex, 1);

        let tdIndex = items[index].querySelectorAll('td')[1].innerText;
        let indexAllcertificates = allCertificateNums.findIndex(ind => ind === +tdIndex);
        allCertificateNums.splice(indexAllcertificates, 1);
    }
    selectedNames = [];
    delItemsArr = [];
    optButtons.style.visibility = 'hidden';
});

let delItemsArr = [];

let buttons = document.querySelectorAll('.buttons li');

let loadButton = document.querySelector('.loadButton');
loadButton.addEventListener('click', () => {
    window.api.send('open-file');
});

let createButton = document.querySelector('.createButton');
createButton.addEventListener('click', () => {
    let send = names;
    if(selectedNames.length > 0) send = selectedNames;
    if(send.length > 0) {
        window.api.send('create', send);
    }else {
        alert('База даних імен не завантажена!');
    }
});

window.api.receive('done', data => {
    showTopButtons(true);
    setTimeout(() => {
        alert(data);
    }, 100);
});

let createLayout = document.querySelector('.createLayout');
createLayout.addEventListener('click', () => {
    window.api.send('layout-window', true);
});

window.api.receive('file', data => {
    try {
        createTable(data);
    }catch(e) {
        alert('Помилка завантаження файлу xlsx!');
    }
});

window.api.receive('error', data => {
    if(!data && typeof data === 'boolean') {
        showTopButtons(false);
        loader();
    }else {
        alert(data);
    }
});

let cancelButton = document.querySelector('.cancelButton');
cancelButton.addEventListener('click', () => {
    showTopButtons(true);
    window.api.send('cancel-certificate', true);
});
window.api.receive('canceled-certificate', data => {
    alert(data);
});

function showTopButtons(show) {
    if(show) {
        headerShow();
        for(let i = 0; i < buttons.length; i++) {
            buttons[i].removeAttribute('style');
        }
        
        if(selectedNames.length > 0) {
            optButtons.style.visibility = 'visible';
        }
    }else {
        for(let i = 0; i < buttons.length; i++) {
            buttons[i].style.display = 'none';
        }
        cancelButton.parentElement.style.display = 'block';

        if(optButtons.style.visibility === 'visible') {
            optButtons.style.visibility = 'hidden';
        }
    }
}

let chrCodes = { 105: 1110, 73: 1030, 99: 1089 };
function replaceChars(str) {
    return str.split('').map(i => {
        let code = i.charCodeAt();
        return (chrCodes[code]) ? String.fromCharCode(chrCodes[code]) : i;
    }).join('');
}

function nameUpperCase(name) {
    name = name.toLowerCase();
    let u = true;
    let fullName = '';
    let l;
    for(let i = 0; i < name.length; i++) {
        l = name[i];
        if(u) {
            l = name[i].toUpperCase();
            u = false;
        }
        if(/\s|\-/.test(name[i])) u = true;
        fullName += l;
    }
    return fullName;
}

function removeSpaces(name) {
    return name.replace(/^\s+|\s+$/g,'');
}

function checkRepeat(nameStr) {
    return names.every(n => n.name !== nameStr);
}

function checkEmail(emailStr) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    let t = re.test(emailStr);
    if(t && /gmail|ukr/.test(emailStr)) {
        return /gmail.com$|ukr.net$/.test(emailStr);
    }else {
        return t;
    }
}

let errors = 0;
let nameClass = '';
function checkName(nameStr) {
    return {
        nameClass: '',
        errors: 0,
    }
    // nameClass = '';
    // if(!/^[\u0400-\u04FF\u2019\u0027\-]{2,}\s[\u0400-\u04FF\u2019\u0027\-]{2,}\s[\u0400-\u04FF\u2019\u0027]{2,}$/g.test(nameStr) || !/вич|вна/ig.test(nameStr.slice(-3))) {
    //     errors += 1;
    //     nameClass = 'mistake';
    // }

    // return {
    //     nameClass,
    //     errors,
    // }
}

let repeatCount = 0;
function createTable(data) {
    table.innerHTML = "";

    let tbody = document.createElement('tbody');

    let len = data.length;
    let keys = ['nameU', 'emailU'];
    
    let certificateNumber = 1;
    let empties = 0;
    
    errors = 0;
    repeatCount = 0;
    names = [];
    selectedNames = [];
    delItemsArr = [];

    if(optButtons.style.visibility === 'visible') {
        optButtons.style.visibility = 'hidden';
    }

    for(let i = 0, j = 2; i < len; i++, j++) {
        if(!data[i][keys[0]]) {empties += 1;continue;}
    
        nameClass = ''

        let nameStr = data[i][keys[0]];
        nameStr = removeSpaces(nameStr);
        nameStr = replaceChars(nameStr);

        if(nameStr.indexOf('  ') >= 0) nameStr = nameStr.split(' ').filter(n => n !== '').join(' ');
    
        nameStr = nameUpperCase(nameStr);
    
        if(nameStr.indexOf('іі') >= 0) nameStr = nameStr.replace('іі', 'ії');
    
        ({ nameClass, errors } = checkName(nameStr));
        
        let repeat = checkRepeat(nameStr);
        if(!repeat) {repeatCount += 1; continue;}

        let emailStr = (data[i][keys[1]]) ? data[i][keys[1]] : '';
        let emailCheck = checkEmail(emailStr);
        let mailDisable = '';
        if(!emailCheck) mailDisable = ' disable';
    
        let id = i + 1 - empties - repeatCount;
        
        if(!nameClass) {
            names.push({ name: nameStr, certificate: id, email: emailStr });
        }

        let tr = tbody.insertRow();
        if(nameClass) tr.classList.add(nameClass);
        for(let j = 0; j < 5; j++) {
            let td = tr.insertCell();
            if(j === 4) td.innerText = nameStr;
            if(j === 3) td.innerHTML = `<div class='editicon'></div>`;
            if(j === 2) td.innerHTML = `<div class='mailicon${mailDisable}' title="${emailStr}"></div>`;
            if(j === 1) td.innerText = certificateNumber;
            if(j === 0) td.innerHTML = '<input type="checkbox">';
        }
        certificateNumber += 1;
    }
    table.appendChild(tbody);

    nodes = Array.from(table.querySelector('tbody').children);
    allCertificateNums = [...Array(nodes.length).keys()].map(i => i + 1);

    let errLastNum = errors % 10;
    let repeatLastNum = repeatCount % 10;
    
    let errStrEnd = (errLastNum === 1) ? 'ка' : ((errLastNum > 1 && errLastNum <= 4) ? 'ки' : 'ок');
    let errStr = `${errors} помил${errStrEnd}`;

    let repeatStrEnd = (repeatLastNum === 1) ? '' : ((repeatLastNum > 1 && repeatLastNum <= 4) ? 'и' : 'ів');
    let repeatStr = `${repeatCount} повтор${repeatStrEnd}`;

    header.innerHTML = `<span>${len - empties}: ${errStr}, ${repeatStr}</span>`;

}

let inputActive = false;
let inputIndex = 0;
let selectedTextInput = false;
function checkSelectedTextInput(input) {
    let startPos = input.selectionStart;
    let endPos = input.selectionEnd;
    
    if(input.value.substring(startPos, endPos).length !== 0) {
        return true;
    }
    return false;
}
let items = document.querySelector('table');
let wasUp = false;
let wasD = false;
document.addEventListener('mousedown', e => {
    if(e.target.tagName !== 'INPUT') wasD = true;
});
document.addEventListener('mouseup', e => {
    if(nodes.length > 0 && inputIndex >= 0 && !wasD) {
        let input = nodes[inputIndex].querySelectorAll('input');
        if(input[1]) {
            selectedTextInput = checkSelectedTextInput(input[1]);
            wasUp = true;
        }
    }
    wasD = false;
});
document.addEventListener('click', e => {
    
    if(inputActive && e.target.tagName !== 'INPUT') {
        let input = nodes[inputIndex].querySelectorAll('input');

        if(!wasUp) selectedTextInput = false;
        if(!selectedTextInput) {
            let inputStr = input[1].value;
            let tdValue = nodes[inputIndex].querySelectorAll('td');
            inputStr = removeSpaces(inputStr);
            inputStr = nameUpperCase(inputStr);
            tdValue[4].innerHTML = '';
            tdValue[4].innerText = inputStr;
            tdValue[4].removeAttribute('style');
            inputActive = false;

            let { nameClass } = checkName(inputStr);
            if(!nameClass) {
                if(nodes[inputIndex].classList.contains('mistake')) {
                    nodes[inputIndex].classList.remove('mistake');
                    names.splice(inputIndex, 0, {name: inputStr, certificate: +tdValue[1].innerText, email: tdValue[2].querySelector('div').getAttribute('title')});

                    if(nodes[inputIndex].querySelector('input').checked)
                    selectedNames.push({name: inputStr, certificate: +tdValue[1].innerText, email: tdValue[2].querySelector('div').getAttribute('title')});
                }
            }else {
                if(!nodes[inputIndex].classList.contains('mistake')) {
                    nodes[inputIndex].classList.add(nameClass);
                    names.splice(inputIndex, 1);

                    let selectedInd = selectedNames.findIndex(o => o.certificate === +tdValue[1].innerText);
                    selectedNames.splice(selectedInd, 1);
                }
            }
        }
    }
    wasUp = false;
});

let dbClick = false;
let timer1;
let chk = false;

let editInd = 0;
let backgroundEdit = document.querySelector('.backgroundEdit');
let editWindow = document.querySelector('.editWindow');
let editInput = editWindow.querySelectorAll('input');

items.addEventListener('click', e => {
    if(inputActive) return false;
    dbClick = false;
    clearTimeout(timer1);
    timer1 = setTimeout(function() {
        if(!dbClick) {
            let parent = getParent(e.target);
            let ind = nodes.findIndex(find => find === parent);

            let editIcon = getParent(e.target, 'TD');
            if(parent.querySelectorAll('td')[3] === editIcon) {

                openEditWindow(parent, ind);

                return false;
            }

            if(e.target.getAttribute('type') === 'checkbox') {
                e.target.checked = e.target.checked ? false : true;
            }
            
            if((!nodes[ind].querySelector('input').checked) && !chk) {
                nodes[ind].querySelector('input').checked = true;

                optButtons.style.visibility = 'visible';
                delItemsArr.push(ind);
                if(parent.getAttribute('class') !== 'mistake') {
                    let nameInd = names.findIndex(l => l.name === nodes[ind].querySelectorAll('td')[4].innerText);
                    
                    if(names[nameInd].certificate === 0) {
                        selectedNames.push({
                            name: nodes[ind].querySelectorAll('td')[4].innerText,
                            certificate: +nodes[ind].querySelectorAll('td')[1].innerText,
                            email: nodes[ind].querySelectorAll('td')[2].querySelector('div').getAttribute('title')
                        });
                    }else {
                        selectedNames.push(names[nameInd]);
                    }
                }

                chk = false;
            }else {
                if(!chk) {
                    let delInd = delItemsArr.findIndex(i => i === ind);
                    delItemsArr.splice(delInd, 1);
                    selectedNames.splice(delInd, 1);

                    nodes[ind].querySelector('input').checked = false;
                }
            }

            optButtons.querySelectorAll('span')[1].innerText = delItemsArr.length;
            if(delItemsArr.length === 0) optButtons.style.visibility = 'hidden';

            optButtons.querySelector('.edit').removeAttribute('style');
            if(delItemsArr.length > 1) optButtons.querySelector('.edit').style.display = 'none';
        }

    }, 200);
});

items.addEventListener('dblclick', e => {
    if(e.target.tagName !== 'INPUT') {
        dbClick = true;
        let ind = nodes.findIndex(find => find === e.target.parentNode);
        let node = nodes[ind].querySelectorAll('td')[4];
        let name = node.innerText;

        node.innerHTML = `<input type="text" value="${name}">`;
        node.querySelector('input').focus();
        node.querySelector('input').setSelectionRange(name.length, name.length);
        node.querySelector('input').style.padding = '5px';
        node.style.padding = '6px 12px';

        inputActive = true;
        inputIndex = ind;
    }
});

function getParent(tr, tag = 'TR') {
    if(tr.tagName !== tag) {
        return getParent(tr.parentNode, tag);
    }
    return tr;
}

let progress;
window.api.receive('count', data => {
    progress = header.querySelector('.progress');
    progress.querySelector('span').innerText = data;
});

function loader() {
    header.querySelector(':scope > span').style.display = 'none';
    let createCert = (selectedNames.length > 0) ? selectedNames.length : names.length;
    if(!header.querySelector('.loader')) {
        header.innerHTML += `<div class="loader"><img src="images/ajax-loader.gif"></div><div class="progress"><span>0</span><span>/${createCert}</span></div>`;
        header.querySelector('.progress').style.display = 'block';
    }else {
        header.querySelector('.loader').style.display = 'block';
        header.querySelector('.progress').style.display = 'block';
        header.querySelector('.progress').querySelectorAll('span')[0].innerText = '0';
        header.querySelector('.progress').querySelectorAll('span')[1].innerText = '/' + createCert;
    }
}
function headerShow() {
    header.querySelector(':scope > span').style.display = 'block';
    header.querySelector('.loader').style.display = 'none';
    header.querySelector('.progress').style.display = 'none';
    header.querySelector('.progress').querySelector('span').innerText = '0';
}

let saveButton = document.querySelector('.saveButton');
let saveError = document.querySelector('.saveError');
saveButton.addEventListener('click', () => {
    let items = table.querySelectorAll('tr')[editInd].querySelectorAll('td');

    let firstCert = +items[1].innerText;

    let name = editInput[1].value;
    let cert = editInput[0].value;
    let email = editInput[2].value;

    let { found, available } = checkCertificateNumber(cert);
    if(found && +cert !== +items[1].innerText) {
        saveError.innerText = `Такий сертифікат існує. Доступні: ${available.join(',')} і т.д.`;
        return false;
    }else {
        let currentCertInd = allCertificateNums.findIndex(i => i === +items[1].innerText);
        allCertificateNums.splice(currentCertInd, 1);
        allCertificateNums.push(+cert);
    }
    allCertificateNums.sort((a,b) => a - b);

    items[1].innerText = cert;
    items[2].querySelector('div').setAttribute('title', email);
    items[4].innerText = name;

    editWindow.style.display = 'none';
    backgroundEdit.style.display = 'none';

    let mailCheck = checkEmail(email);
    if(mailCheck) {
        items[2].querySelector('div').classList.remove('disable');
    }else {
        items[2].querySelector('div').classList.add('disable');
    }

    let rightIndexPosition = editInd;
    let err = 0;
    for(let i = editInd-1; i >= 0; i--) {
        if(nodes[i].classList.contains('mistake')) err += 1;
    }
    if(err > 0) rightIndexPosition -= err;

    let { nameClass } = checkName(name);

    if(!nameClass) {
        
        let nameInd = names.findIndex(a => a.certificate === firstCert);

        let selectedInd = selectedNames.findIndex(b => b.certificate === firstCert);
        if(nameInd >= 0) {
            names[nameInd].name = name;
            names[nameInd].certificate = +cert;
            names[nameInd].email = email;

            
            if(selectedInd !== -1) {
                selectedNames[selectedInd].name = name;
                selectedNames[selectedInd].certificate = +cert;
                selectedNames[selectedInd].email = email;
            }
        }else {
            if(nodes[editInd].classList.contains('mistake')) {
                nodes[editInd].classList.remove('mistake');
                names.splice(rightIndexPosition, 0, {name: name, certificate: +cert, email: email});
            }

            if(items[0].querySelector('input').checked)
                selectedNames.push({name: name, certificate: +cert, email: email});
        }

    }else {
        if(!nodes[editInd].classList.contains('mistake')) {
            nodes[editInd].classList.add(nameClass);
            names.splice(rightIndexPosition, 1);

            let selectedInd = selectedNames.findIndex(o => o.certificate === +cert);
            selectedNames.splice(selectedInd, 1);
        }
    }

});

function openEditWindow(pr, ind) {
    editInd = ind;
    let nameData = pr.querySelectorAll('td');

    backgroundEdit.style.display = 'block';
    editWindow.style.display = 'block';

    saveError.innerText = '';

    editInput[0].value = nameData[1].innerText;
    editInput[1].value = nameData[4].innerText;
    editInput[2].value = nameData[2].querySelector('div').getAttribute('title');

}

function checkCertificateNumber(num) {

    let found = allCertificateNums.some(el => el === +num);
    let available = [];
    let first = 1;
    let max = 0;
    for(let i = 0; i < allCertificateNums.length; i++) {
        let num = allCertificateNums[i];
        if(num > max) max = num;
        if(first < num) {
            i--;
            available.push(first);
        }
        first++;
    }

    available.push(max + 1);
    
    return { found, available }
}