function typerFactory(selector, speed, parent = document) {
    let _lines = parent.querySelectorAll(selector);
    let _linesCopy = Array.from(_lines).map( line => line.innerHTML );
    
    let _char = 0;
    let _line = 0;
    let _interval;
    let _spanTimeout;
    // let _running = false;
    // const isRunning = () => _running;
    
    function start() {
        initiate();
        // _running = true;
        _interval = setInterval(_type, speed);
    }
    
    function initiate() {
        // _running = false;
        clearInterval(_interval);
        clearTimeout(_spanTimeout);
        _lines.forEach( line => {
            line.dataset.cursor = 'hidden';
            line.innerHTML = ' '
        });
        _char = 0;
        _line = 0;
    }
    
    function _type() {
        _lines[_line].dataset.cursor = 'visible';
        if ( _char >= _linesCopy[_line].length ) {
            _lines[_line].dataset.cursor = 'hidden';
            
            if ( _line >= _linesCopy.length - 1) {
                clearInterval(_interval);
            }
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
                    _spanTimeout = setTimeout(type, speed);
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

    return { start, initiate, /* isRunning */ };
}


function textWindow(windowNumber) {
    let _window = document.querySelectorAll('.window')[windowNumber];
    console.log(_window);
    const _tabs = _window.querySelectorAll('.tab');
    let _lineNumbers = _window.querySelector('.line_numbers');
    let _currentTab = 1;
    let _isLeaving = false;

    let _typers = [];
    for (tab of _tabs) {
        _typers.push(typerFactory('.typer', 20, _window.querySelector(`.code div[data-tab="${tab.dataset.tab}"]`)));
    }
    
    let _observerOptions = {
        threshold: [0.5]
    };
    let _observer = new IntersectionObserver( (entries) => {  
        let typer = _typers[_currentTab - 1];
        if (entries[0].isIntersecting) {
            console.log('observed');    
            _isLeaving = true;
            typer.start();
        }
        else {
            _isLeaving = false;
            typer.initiate();
        }
    }, _observerOptions);
        
    function _calcLineNumbers() {
        _lineNumbers.innerHTML = '';
        for (let i = 1; i <= _window.querySelector('.code div[data-selected="true"').childElementCount; i++) {
            let pre = document.createElement('pre');
            pre.innerHTML = i;
            _lineNumbers.appendChild(pre);
        }
    }
    
    function init() {
        _calcLineNumbers();
        
        _observer.observe(_window);

        _tabs.forEach( tab => tab.addEventListener('click', e => {
            tab.dataset.selected = 'true';
            _window.querySelectorAll(`.code div[data-tab]`).forEach( tabWindow => tabWindow.dataset.selected = 'false');
            _window.querySelector(`.code div[data-tab="${tab.dataset.tab}"]`).dataset.selected = 'true';

            if (_currentTab != tab.dataset.tab) {
                _currentTab = tab.dataset.tab;
                if (_isLeaving) {
                    _typers[_currentTab - 1].start();
                }
            }

            _calcLineNumbers();
                
            _tabs.forEach( othertab => {
                if (othertab != tab) {
                    othertab.dataset.selected = 'false';
                    _typers[othertab.dataset.tab - 1].initiate();
                }
            })
        }));    
    }

    return { init };
}

let window1 = textWindow(0);
window1.init();
