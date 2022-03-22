module.exports = (name = ['Іванова', 'Світлана', 'Іванівна'], number = 11111, bgImg = '', pos = 0) => {

    // key - class, value - Name, SecondName, ThirdName
    let blockArr = [
        {first: name[0], second: name[1], third: name[2]},
        {first: name[0], second:`${name[1]} ${name[2]}`},
        {first:`${name[1]} ${name[0]}`, second:name[2]},
        {first:`${name[0]} ${name[1]}`, second:name[2]},
    ];

    let block = '';
    for(let key in blockArr[pos.type]) {
        block += `<div class="${key}">${blockArr[pos.type][key]}</div>`
    }
    block += `<div class="number">${number}</div>`;

    let styleStr = '';
    for(let key in pos) {
        if(typeof pos[key] !== 'object' || key === 'format') continue;
        styleStr += `.${key} {`;
        for(let key2 in pos[key]) {
            if(key2 === 'font') {
                styleStr += `${key2}: `;
                styleStr += [].concat(...pos[key][key2]).join(' ');
            }else {
                styleStr += `${key2}: ${pos[key][key2]}`;
            }
            styleStr += (!isNaN(pos[key][key2].toString())) ? 'px;' : ';';
        }
        styleStr += '}';
    }
    
    let width = parseInt(pos.format.w * pos.format.factor) + 'px';
    let height = parseInt(pos.format.h * pos.format.factor) + 'px';

    if(pos.orientation === 'portrait') {
        width = parseInt(pos.format.h * pos.format.factor) + 'px';
        height = parseInt(pos.format.w * pos.format.factor) + 'px';
    }

    return `<html>
    <head>
        <base href="http://localhost:3000" target="_blank">
        <style type="text/css">
            html, body {
                padding: 0;
                margin: 0;
            }
            main {
                background:url('./${bgImg}') no-repeat;
                background-size: cover;
                background-position: left top;
                width: 100%;
                height: 100%;
                padding:0;
                margin:0;
                position: relative;
            }
            main div {
                position: absolute;
                white-space: nowrap;
            }
            ${styleStr}
        </style>
    </head>
    <body>
        <main>${block}</main>
    </body>
    </html>`;
}