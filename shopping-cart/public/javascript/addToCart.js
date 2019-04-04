(function () { 
    const addButton = document.getElementById('addButton');
    const imagePath = document.getElementById('img').src;
    const pname = document.getElementById('pname').textContent;
    const pdescription = document.getElementById('description').innerText;
    let purl = document.getElementById('addButton').href;
    let pid = (purl.match(/(\d+)/g) || []);
    let price = parseFloat(document.getElementById('productPrice').innerText);
    let idx = document.getElementById('qty').selectedIndex;

    addButton.addEventListener('click', (evt) => {
    let idx = document.getElementById('qty').selectedIndex;
    let options = document.getElementById('qty').options;
    let qty = parseInt(options[idx].text);
    let obj = { pid: pid[1], image: imagePath, productName: pname, productPrice: price, description: pdescription, qty: qty };
    let req = new XMLHttpRequest();
    req.open('POST', `/add-to-cart/:id`);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.responseType = 'json';
    req.onload = function (evt) {
        if (req.status == 200) { // check for ok response
        const resp = req.response;
        console.log(resp);
        if (resp.exist == false) {
            window.alert("Item has been added to the cart");
            location.reload();
        }
        else {
            window.alert("Item is already in the shopping cart");
        }
        }
        else {
        console.log('err', req);
        }
    };
    console.log('sending', obj);
    req.send(JSON.stringify(obj));
    });
}());