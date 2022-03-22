let btn = document.querySelectorAll('button');
let test = document.querySelector('.test');

// відступи для різних шрифтів, по різному себе ведуть в документі
let fontTop = 0;
let fontLeft = 0;

let itemsPositionDefault = {
    first:{top:0,left:0,width:0,'text-align':'left',font:[['normal'],'38px','Arial'],display:'block'},
    second:{top:0,left:0,width:0,'text-align':'left',font:[['normal'],'38px','Arial'],display:'block'},
    third:{top:0,left:0,width:0,'text-align':'left',font:[['normal'],'38px','Arial'],display:'block'},
    number:{top:0,left:0,width:0,'text-align':'left',font:[['normal'],'32px','Arial'],display:'block'},
    type: 0,
    format: {type:'A4', w:0, h:0, factor: 0},
    orientation: 'portrait'
};
let jsonStrItemsPosition = JSON.stringify(itemsPositionDefault);
let itemsPosition = JSON.parse(jsonStrItemsPosition);
window.api.send('create-file-positions', JSON.stringify(itemsPosition));

let topMenu = document.querySelector('.top');
topMenu.addEventListener('click', e => {
    if(e.target.tagName === 'BUTTON') {
        let btn = topMenu.querySelectorAll('button');
        let ind = Array.from(btn).indexOf(e.target);

        if(ind < 6) {
            let param = 'text-align';
            if(ind === 1) param = 'font-style'; // 4
            if(ind === 2) param = 'font-weight'; // 5
            
            if(ind > 0) itemStylePropety(param, btn[ind].innerText.toLowerCase()); //
            setActiveButton(ind);
        }
    }
});

function setActiveButton(ind) {
    let text = btn[ind].innerText;
    if(/center|left|right/g.test(text)) {
        btn[3].classList.remove('active');

        btn[4].classList.remove('active');

        btn[5].classList.remove('active');
    }

    if(!btn[ind].classList.contains('active')) {
        btn[ind].classList.add('active');
    }else {
        btn[ind].classList.remove('active');
    }
}


btn[6].addEventListener('click', () => {
    window.api.send('open-template', '');
});
window.api.receive('opened-template', path => {
    path = path.replace(/\\/g, "\\\\");
    let bgUrl = `url("file:///${path}")`;
    bg.style.backgroundImage = bgUrl;

    itemsPosition.bgImage = bgUrl;
});

// hide button

btn[0].addEventListener('click', () => {
    if(!bgDiv[cIndex].classList.contains('hide')) {
        bgDiv[cIndex].classList.add('hide');
        itemsPosition[bgDiv[cIndex].dataset.name].display = 'none';
    }else {
        bgDiv[cIndex].classList.remove('hide');
        itemsPosition[bgDiv[cIndex].dataset.name].display = 'block';
    }
});

// font block

let selectBlocks = document.querySelectorAll('select');
let fonts = ['Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Tahoma', 'Courier New', 'Calibri', 'Myriad Pro', 'Segoe UI'];
fonts = fonts.sort();
let fontsHTML = '';
for(let f = 0; f < fonts.length; f++) {
    fontsHTML += `<option value="${fonts[f]}">${fonts[f]}</option>`;
}
selectBlocks[3].innerHTML = fontsHTML;

selectBlocks[3].addEventListener('change', function() {
    for(let i = 0; i < elements.length; i++) {
        itemsPosition[bgDiv[elements[i]].dataset.name].font[2] = this.value;
        bgDiv[elements[i]].style.fontFamily = this.value;
    }
});

selectBlocks[3].selectedIndex = 0;

// ----------

let fontSizes = [...Array(20).keys()].map(i => 20 + (2 * i));
for(let i = 0; i < fontSizes.length; i++) {
    selectBlocks[4].options[i] = new Option(fontSizes[i],fontSizes[i]);
}
selectBlocks[4].addEventListener('change', function() {
    let size = this.value + 'px';
    itemsPosition[bgDiv[cIndex].dataset.name].font[1] = size;
    bgDiv[cIndex].style.fontSize = size;
});

// ----------

function itemStylePropety(key, val) {
    let val2 = val;
    for(let i = 0; i < elements.length; i++) {
        if(val2 === 'center' && key === 'left') {
            val = bg.clientWidth / 2 - bgDiv[elements[i]].clientWidth / 2 + 'px';
            itemsPosition[bgDiv[elements[i]].dataset.name].left = 0;
        }
        if(val2 === 'bold' || val2 === 'italic') {
            let styles = itemsPosition[bgDiv[elements[i]].dataset.name].font[0];
            if(styles.indexOf('normal') >= 0) itemsPosition[bgDiv[elements[i]].dataset.name].font[0] = [];
            
            if(styles.indexOf(val2) >= 0) {
                styles.splice(styles.indexOf(val2), 1);
                bgDiv[elements[i]].style.removeProperty(key);
            }else {
                itemsPosition[bgDiv[elements[i]].dataset.name].font[0].push(val2);
                bgDiv[elements[i]].style.setProperty(key, val2);
            }
            if(styles.length === 0) styles.push('normal');
        }else {
            bgDiv[elements[i]].style.setProperty(key, val);
            itemsPosition[bgDiv[elements[i]].dataset.name]['text-align'] = val;
        }
    }

}

let elements = [];
let bg = document.querySelector('.background');

let activeElement;
let move = false;
let click = false;
let l = 0;
let t = 0;

let mousePositionX = 0;
let cIndex;

let bgDiv;
let typesBlock = [
        `
        <div style="top:30px;left:20px;" data-name="first"><span>Ім'я</span><div class="resize"></div></div>
        <div style="top:80px;left:20px;" data-name="second"><span>Прізвище</span><div class="resize"></div></div>
        <div style="top:130px;left:20px;" data-name="third"><span>По батькові</span><div class="resize"></div></div>
        `,
        `
        <div style="top:30px;left:20px;" data-name="first"><span>Прізвище</span><div class="resize"></div></div>
        <div style="top:80px;left:20px;" data-name="second"><span>Ім'я та По батькові</span><div class="resize"></div></div>
        `,
        `
        <div style="top:30px;left:20px;" data-name="first"><span>Ім'я та Прізвище</span><div class="resize"></div></div>
        <div style="top:80px;left:20px;" data-name="second"><span>По батькові</span><div class="resize"></div></div>
        `,
        `
        <div style="top:30px;left:20px;" data-name="first"><span>Прізвище та Ім'я</span><div class="resize"></div></div>
        <div style="top:80px;left:20px;" data-name="second"><span>По батькові</span><div class="resize"></div></div>
        `
];

let blockInd = itemsPosition.type;

selectBlocks[0].addEventListener('change', function() {
    blockInd = this.value;
    let top = (blockInd > 0) ? 130 : 180;
    bg.innerHTML = `${typesBlock[blockInd]}<div style="top:${top}px;left:20px;" data-name="number"><span>1234</span><div class="resize"></div></div>`;
    bgDiv = bg.querySelectorAll(':scope > div');
    
    itemsPosition = JSON.parse(jsonStrItemsPosition);
    
    for(let i = 0; i < bgDiv.length; i++) {
        itemsPosition[bgDiv[i].dataset.name].width = bgDiv[i].clientWidth;
        bgDiv[i].style.font = fontStr(itemsPosition[bgDiv[i].dataset.name].font);
    }
    cIndex = -1;
    itemsPosition.type = +blockInd;

    for(let i = 1; i < btn.length; i++) {
        btn[i].classList.remove('active');
    }
});

selectBlocks[0].selectedIndex = blockInd;
selectBlocks[0].dispatchEvent(new Event('change'));
itemsPosition.type = blockInd;

function fontStr(arr) {
    return `${arr[0].join(' ')} ${arr[1]} ${arr[2]}`;
}

// mm
let formats = {
    a4:{w:297, h:210},
    a5:{w:210, h:148.5},
    a6:{w:148.5, h:105},
}
let orient = 0; // 0 - portrait, 1 - landscape
let factor = 3.779527;
itemsPosition.format.factor = factor;
selectBlocks[1].addEventListener('change', function() {
    let val = this.options[this.selectedIndex].value;

    itemsPosition.format.type = val.toUpperCase();
    itemsPosition.format.w = formats[val].w;
    itemsPosition.format.h = formats[val].h;

    getFormatDimensions(val);
});
selectBlocks[2].addEventListener('change', function() {
    let val = this.options[this.selectedIndex].value;
    let formatVal = selectBlocks[1].value;

    orient = (val === 'portrait') ? 0 : 1;
    itemsPosition.orientation = val;

    getFormatDimensions(formatVal);

});
selectBlocks[1].dispatchEvent(new Event('change'));

function getFormatDimensions(val) {
    let formatWidth = formats[val].w;
    let formatHeight = formats[val].h;

    if(!orient) {
        formatWidth = formats[val].h;
        formatHeight = formats[val].w;
    }

    bg.style.width = (formatWidth * factor).toFixed(2) + 'px';
    bg.style.height = (formatHeight * factor).toFixed(2) + 'px';
}

function tag(elem) {
    if(elem.tagName !== 'DIV') {
        return tag(elem.parentNode);
    }else {
        return elem;
    }
}

let resizeClick = false;
bg.addEventListener('mousedown', e => {
    mousePositionX = e.pageX;

    let elem = tag(e.target);
    if(elem.tagName === 'DIV' && elem.getAttribute('class') !== 'resize' && e.target !== bg) {
        let index = [...elem.parentNode.children].indexOf(elem);

        bgDiv.forEach(el => {
            removeStyleProperty(el, ['border', 'padding', 'background']);
            el.querySelector('.resize').style.display = 'none';
            el.removeAttribute('selected');
        });

        if(elements.indexOf(index) === -1) {
            elements = [];
            elements.push(index);
        }
        
        cIndex = index;
        click = true;
        
        if(!bgDiv[index].getAttribute('selected')) {
            bgDiv[index].setAttribute('style', bgDiv[index].getAttribute('style') + ' border:1px solid gray;padding:0;background:none;');
            bgDiv[index].querySelector('.resize').style.display = 'block';
            bgDiv[index].setAttribute('selected', 'true');
        }else {
            bgDiv[index].removeAttribute('selected');
        }

        l = e.pageX - elem.offsetLeft;
        t = e.pageY - elem.offsetTop;

        let block = itemsPosition[bgDiv[index].dataset.name];
        let sFont = block.font[2];
        let fontInd = Array.from(selectBlocks[3].options).findIndex(f => f.value === sFont);
        selectBlocks[3].selectedIndex = fontInd;
        let sFontSize = block.font[1];
        let fontSizeInd = Array.from(selectBlocks[4].options).findIndex(f => f.value === /[0-9]+/g.exec(sFontSize)[0]);
        selectBlocks[4].selectedIndex = fontSizeInd;

        btn.forEach(el => el.classList.remove('active'));
        let sStyle = block['text-align'];
        switch(sStyle) {
            case 'left':
                btn[4].classList.add('active');
                break;
            case 'right':
                btn[5].classList.add('active');
                break;
            case 'center':
                btn[3].classList.add('active');
        }
        let fStyles = block.font[0];

        for(let i = 0; i < btn.length; i++) {
            if(fStyles.indexOf(btn[i].innerText) >= 0) btn[i].classList.add('active');
        }

        if(block.display === 'none') {
            btn[0].classList.add('active');
        }

    }

    if(e.target.tagName === 'DIV' && e.target.getAttribute('class') === 'resize') {
            resizeClick = true;
    }

    e.stopPropagation();
});

function getFont(el) {
    return itemsPosition[el.dataset.name].font[2];
}

bg.addEventListener('mouseup', e => {
    //resizeClick = false;
    if(!move && cIndex >= 0 && !resizeClick) {
        if(!bgDiv[cIndex].getAttribute('selected')) {
            let ind = elements.indexOf(cIndex);
            if(ind >= 0) elements.splice(ind, 1);
            bgDiv[cIndex].style.removeProperty('border');
            bgDiv[cIndex].style.removeProperty('padding');
            bgDiv[cIndex].querySelector('.resize').style.display = 'none';
        }
    }
    if(e.target === bgDiv[cIndex]) resizeClick = false;
    move = false;
    click = false;
    
    if(cIndex === -1) return;
    
    let topPos = bgDiv[cIndex].offsetTop + fontTop;
    let leftPos = bgDiv[cIndex].offsetLeft + fontLeft;
    if(leftPos === '') leftPos = 0;

    let nameDiv = bgDiv[cIndex].dataset.name;
    let elemWidth = bgDiv[cIndex].clientWidth;
    
    if(!itemsPosition[nameDiv]) {
        itemsPosition[nameDiv] = {ind: cIndex, top: topPos, left: leftPos};
    }else {
        itemsPosition[nameDiv].top = topPos;
        itemsPosition[nameDiv].left = leftPos + 1;
        itemsPosition[nameDiv].width = elemWidth;
    }
});

bg.addEventListener('mousemove', e => {
    let x = e.pageX;
    let y = e.pageY;

    if(click && x !== mousePositionX) {
        move = true;
        
        let el = bgDiv[cIndex];
        if(!el.getAttribute('selected')) el.setAttribute('selected', 'true');
        
        el.style.left = (x - l) + 'px';
        el.style.top = (y - t) + 'px';

        if(y - t <= 0) el.style.top = '0px';
        if(x - l <= 0) el.style.left = '0px';

        if(e.pageY - t + el.clientHeight >= bg.clientHeight) el.style.top = (bg.clientHeight - el.clientHeight) + 'px';
    }

    if(resizeClick) {
        bgDiv[cIndex].style.width = x - bgDiv[cIndex].offsetLeft - bg.offsetLeft + 'px';
    }
});

let removeStyleProperty = (elem, prop, i = 0) => {
        elem.style.removeProperty(prop[i]);
        if(i < prop.length) removeStyleProperty(elem,prop,++i);
}
bg.addEventListener('click', e => {
    if(e.target === bg && !resizeClick) {
        for(let i = 0; i < elements.length; i++) {
            let id = elements[i];
            removeStyleProperty(bgDiv[id], ['border', 'padding', 'background']);
            bgDiv[id].removeAttribute('selected');
            bgDiv[id].querySelector('.resize').style.display = 'none';
        }
        elements = [];
        cIndex = -1;

        btn.forEach(el => el.classList.remove('active'));
    }
    resizeClick = false;
});

let timer;
document.addEventListener('keydown', e => {
    if(cIndex >= 0) {
        for(let i = 0; i < elements.length; i++) {
            arrowPress(bgDiv[elements[i]], e.key);
        }
        clearTimeout(timer);
        timer = setTimeout(function() {
            window.api.send('create-file-positions', JSON.stringify(itemsPosition));
        }, 1000);
    
        e.preventDefault();
    }
});
function arrowPress(el, key) {
    let val;
    let num;
    switch(key) {
        case 'ArrowLeft':
            val = 'left';
            num = -1;
            break;
        case 'ArrowUp':
            val = 'top';
            num = -1;
            break;
        case 'ArrowRight':
            val = 'left';
            num = 1;
            break;
        case 'ArrowDown':
            val = 'top';
            num = 1;
    }
    if(val === 'left') {
        el.style.left = (el.offsetLeft + num) + 'px';
    }
    if(val === 'top') el.style.top = (el.offsetTop + num) + 'px';

    itemsPosition[el.dataset.name].left = el.offsetLeft + fontLeft;
    itemsPosition[el.dataset.name].top = el.offsetTop + fontTop;
}

// --------------------

bg.addEventListener('drop', e => {
    let files = e.dataTransfer.files;

    let filepath = files[0].path;
    let filename = files[0].name;
    filepath = filepath.replace(/\\/g, "\\\\");

    let bgUrl = `url("file:///${filepath}")`;
    bg.style.backgroundImage = bgUrl;

    window.api.send('template', {name: filename, src: filepath});
});

bg.addEventListener('dragover', e => {
    e.preventDefault();
    e.stopPropagation();
});

document.addEventListener('click', () => {
    window.api.send('create-file-positions', JSON.stringify(itemsPosition));
});
