function b(count) {
    console.time("perf");
    var style = document.createElement('style');
    document.body.appendChild(style);
    var styleText = document.createTextNode("span.boom { b1ackground-color: rgba(255, 0, 0, .1); } span.boom::before{position: absolute; margin: -4px 0 0 0 ; content: '\\0000a0' attr(data-t); font-size: 9px; color: rgba(0,0,0,.3);vertical-align: baseline;}");
    style.appendChild(styleText);


    var excludes = {"SCRIPT": true, "STYLE": true, "LINK": true};
    var reg = /^\s+$/;
    var nonWord = /\W/;
    for (var k = 0; k < count; k++) {

        var nodes = document.querySelectorAll("*");
        var textNodes = [];
        /*        for (var i = 0; i < nodes.length; i++) {
         nodesSet.add(nodes[i], true)
         }*/
        for (var i = 0; i < nodes.length; i++) {
            if (excludes[nodes[i].nodeName])
                continue;
            var childNodes = nodes[i].childNodes;
            for (var j = 0; j < childNodes.length; j++) {
                //if (!nodesSet.has(childNodes[j]))
                if (childNodes[j].nodeName == '#text' && !reg.test(childNodes[j].nodeValue)) {

                    var text = childNodes[j].nodeValue;
                    var words = text.split(/\b/);

                    var prevChild = childNodes[j];
                    var newChild;
                    for (var p = words.length - 1; p >= 0; p--) {
                        var word = words[p];
                        if (word.length < 2 || nonWord.test(word) || word == +word || !Dict[word.toLowerCase()]) {
                            newChild = document.createTextNode(word);
                        }
                        else {
                            newChild = document.createElement('span');
                            newChild.className = 'boom';
                            newChild.textContent = word;

                            newChild.dataset.t = Dict[word.toLowerCase()];
                        }

                        nodes[i].insertBefore(newChild, prevChild);
                        j++;
                        prevChild = newChild;
                    }
                    nodes[i].removeChild(childNodes[j]);
                    //textNodes.push(childNodes[j].nodeValue);
                }
            }
        }
    }
    console.timeEnd("perf");
    return textNodes
}

var a = {style: "font-size: 12px; text-decoration: blink;", class: 'doit fuck'};

function findWords(text) {
    var words = text.split(/\b/);
    var nonWord = /\W/;
    var list = {};
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (word.length < 2 || nonWord.test(word) || word == +word) {
        }
        else
            list[word.toLowerCase()] = true;

    }
    return Object.keys(list);
}

var Dict = {};

function analize() {
    var words = findWords(document.body.innerText);
    GET('http://localhost:8020/translate/?words=' + words.join(","), function (err, data) {
        Dict = JSON.parse(data);
        b(1);
    });

    console.log(words);

}
analize();
//b(1);

function GET(url, callback) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4) {
            if (xmlhttp.status == 200) {
                callback(null, xmlhttp.responseText);
            }
            else {
                callback(xmlhttp);
            }
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}
