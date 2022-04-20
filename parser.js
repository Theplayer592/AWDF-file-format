window.onload = function(e) {
    //Set the activeElem as the data root
    window.activeElem = document.getElementById("data") || document.body

    //Bold/italics/blockquote mode: on/off
    window.bold = false
    window.italics = false
    window.blockquote = false

    //Default doctype is awdf
    window.doctype = "awdf"

    //Read the file, split it by \n and [space] and parse the data
    readTextFile("./test.awdf", function(d) {
        //Replace regex taken from https://stackoverflow.com/questions/10805125/how-to-remove-all-line-breaks-from-a-string
        parse(d.replace(/(\r\n|\n|\r)/gm, " ").split(" "))
    })
}

//Parses the data from the file after being split up
//@param d = the array of data
function parse(d) {
    console.log(d)

    //The keywords/keysymbols acccepted by the program
    const keywords = {
        "#doctype": function(data) {
            //Set the parse type/doctype
            window.doctype = data.split("\r")[0] //Make sure window's \r doesn't affect the parsing
        },
        "!": function(data) {
            var h1 = document.createElement("h1")
            h1.innerText = data
            document.title = data
            window.activeElem.appendChild(h1)
        },
        "!!": function(data) {
            var h2 = document.createElement("h2")
            h2.innerText = data
            window.activeElem.appendChild(h2)
        },
        "!!!": function(data) {
            var h = document.createElement("h3")
            h.innerText = data
            window.activeElem.appendChild(h)
        },
        "!!!!": function(data) {
            var h = document.createElement("h4")
            h.innerText = data
            window.activeElem.appendChild(h)
        },
        "!!!!!": function(data) {
            var h = document.createElement("h5")
            h.innerText = data
            window.activeElem.appendChild(h)
        },
        "=====": function(data) {
            //Make sure data is definitely worth something
            if (data.trim().length > 1) {
                var h = document.createElement("h1")
                var span = document.createElement("span")
                h.classList += "h"
                span.innerText = data
                h.appendChild(span)
                window.activeElem.appendChild(document.createElement("br"))
                window.activeElem.appendChild(h)
            }
        },
        "-----": function(data) {
            //Make sure data is definitely worth something
            if (data.trim().length > 1) {
                var h2 = document.createElement("h2")
                var span = document.createElement("span")
                h2.classList += "hs"
                span.innerText = data
                h2.appendChild(span)
                window.activeElem.appendChild(document.createElement("br"))
                window.activeElem.appendChild(h2)
            }
        },
        "": function(data) {
            var p = document.createElement("p")
            p.innerText = data
            window.activeElem.appendChild(document.createElement("br"))
            window.activeElem.appendChild(p)
        },
        "\\\\": function(data) {
            var p = document.createElement("p")
            p.innerText = data
            window.activeElem.appendChild(p)
        },
        "**": function(data) {
            if (bold) {
                window.activeElem = window.activeElem.parentNode.parentNode
                window.activeElem.lastElementChild.innerHTML += " " + data
            } else {
                var b = document.createElement("b")
                b.innerText = " " + data

                //If the activeElem doesn't have a last child, just create a span inside of it, and use that
                if (window.activeElem.childElementCount > 0) {
                    window.activeElem.lastElementChild.appendChild(b)
                } else {
                    var span = document.createElement("span")
                    window.activeElem.appendChild(span)
                    span.appendChild(b)
                }
                window.activeElem = b
            }
            window.bold = !bold
        },
        "__": function(data) {
            if (italics) {
                window.activeElem = window.activeElem.parentNode.parentNode
                window.activeElem.lastElementChild.innerHTML += " " + data
            } else {
                var em = document.createElement("em")
                em.innerText = " " + data

                //If the activeElem doesn't have a last child, just create a span inside of it, and use that
                if (window.activeElem.childElementCount > 0) {
                    window.activeElem.lastElementChild.appendChild(em)
                } else {
                    var span = document.createElement("span")
                    window.activeElem.appendChild(span)
                    span.appendChild(em)
                }
                window.activeElem = em
            }
            window.italics = !italics
        },
        "\"\"": function(data) {
            if (blockquote) {
                window.activeElem = window.activeElem.parentNode.parentNode
                window.activeElem.lastElementChild.innerHTML += " " + data
            } else {
                var bq = document.createElement("blockquote")
                bq.innerText = " " + data

                //If the activeElem doesn't have a last child, just create a span inside of it, and use that
                if (window.activeElem.childElementCount > 0) {
                    window.activeElem.lastElementChild.appendChild(bq)
                } else {
                    var span = document.createElement("span")
                    window.activeElem.appendChild(span)
                    span.appendChild(bq)
                }
                window.activeElem = bq
            }
            window.blockquote = !blockquote
        }
    }

    //Holds the data that will be executed
    var toExecute = []

    //Loop through d, and if something begins with a keyword, create a new entry in the toExeccute array
    for (var x in d) {
        var y = d[x]
        if (keywords.hasOwnProperty(y)) {
            toExecute.push({
                key: y,
                data: ""
            })
        } else {
            toExecute[toExecute.length - 1].data += " " + y
        }
    }

    console.log(toExecute)

    //After looping through, we can now execute all of the data
    for (var x in toExecute) {
        var y = toExecute[x]

        //If we are not in awdf format, just parse it as html
        if (window.doctype == "awdf") keywords[y.key.trim()](y.data.trim())
        else window.activeElem.innerHTML += y.key + " " + y.data
    }
}

//Pulled from https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function readTextFile(file, _callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                var allText = rawFile.responseText;
                _callback(allText)
            }
        }
    }
    rawFile.send(null);
}