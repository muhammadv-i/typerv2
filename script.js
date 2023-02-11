function typerFactory(selector, speed) {
    let _lines = document.querySelectorAll(selector);
    let _linesCopy = Array.from(_lines).map( line => line.innerHTML );
    _lines.forEach( line => line.innerHTML = ' ');
    // for (let i = 0; i < _lines.length; i++) {
    //     let pre = document.createElement('pre');
    //     pre.classList.add('typer');
    //     pre.innerHTML = _lines[i].innerHTML;
    //     _lines[i].innerHTML = '';
    //     _linesCopy.push(pre);
    // }

    let _char = 0;
    let _line = 0;
    let _interval;

    function start() {
        _interval = setInterval(_type, speed);
    }
    
    function _type() {
        _lines[_line].dataset.cursor = 'visible';
        if ( _char >= _linesCopy[_line].length ) {
            _lines[_line].dataset.cursor = 'hidden';
            
            if ( _line >= _linesCopy.length - 1) 
            clearInterval(_interval);
            else {
                _char = 0;
                _line++;
            }
        }
        if ( _char == 0 )
            _lines[_line].innerHTML = '';
        
        
        if (_linesCopy[_line].charAt(_char) == '<') {
            let span = _linesCopy[_line].substring(_char);
            let closing = span.indexOf('>');
            closing = span.indexOf('>', closing + 1);
            span = span.substring(0, closing + 1);
            
            let styleClass = span.substring(span.indexOf('"') + 1, span.indexOf('>') - 1);
            
            let spanText = span.match(/>.*</g)[0];
            spanText = spanText.substring(1, spanText.indexOf('<'));
            
            let spanElement = document.createElement('span');
            spanElement.classList.add(styleClass);
            _lines[_line].appendChild(spanElement);
            
            let i = 0;
            (function type() {
                clearInterval(_interval);
                
                if (spanText.charAt(i) == '&') { 
                    if (spanText.charAt(i + 1) == `a`) {
                        _lines[_line].lastChild.textContent += `&`;
                        i += 1;
                    }
                    if (spanText.charAt(i + 1) == 'l') 
                        _lines[_line].lastChild.textContent += `<`;
                    if (spanText.charAt(i + 1) == 'g') 
                        _lines[_line].lastChild.textContent += `>`;
        
                    i += 4;
                }
                else {
                    _lines[_line].lastChild.textContent += spanText.charAt(i);
                    i++;
                }
                if (i < spanText.length) {
                    setTimeout(type, speed);
                }
                _interval = setInterval(_type, speed); 
            })()   
            
            _char += closing + 1;
        }
        else if (_linesCopy[_line].charAt(_char) == '&') { 
            if (_linesCopy[_line].charAt(_char + 1) == `a`) 
                _lines[_line].innerHTML += `&`;
            if (_linesCopy[_line].charAt(_char + 1) == 'l') 
                _lines[_line].innerHTML += `<`;
            if (_linesCopy[_line].charAt(_char + 1) == 'g') 
                _lines[_line].innerHTML += `>`;

            _char += 4;
        }
        else {
            _lines[_line].innerHTML += _linesCopy[_line].charAt(_char);
            _char++;
        }
    }

    return { start };
}

typerFactory('.typer', 20).start();


const tabs = document.querySelectorAll('.tab');
tabs.forEach( tab => tab.addEventListener('click', e => { 
    if (e.target == tab || e.target.parentElement == tab) {
        tab.dataset.selected = 'true';
    }
    tabs.forEach( othertab => {
        if (othertab != tab) {
            othertab.dataset.selected = 'false';
        }
    })
}));

let lineNumebers = document.querySelector('.line_numbers');
for (let i = 1; i < document.querySelector('.code').childElementCount; i++) {
    let pre = document.createElement('pre');
    pre.innerHTML = i;
    lineNumebers.appendChild(pre);
}