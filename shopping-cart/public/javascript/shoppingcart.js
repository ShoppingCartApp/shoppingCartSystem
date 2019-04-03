(function () {

    let productDivs = document.querySelectorAll('div.probbb ');
    for (let i=0; i < productDivs.length; i++) {
        let productDiv = productDivs[i];
        console.log("*********",productDiv);

        updateButton = productDiv.querySelector('.replace');
        updateButton.addEventListener('click', (evt) => {

            let qty = parseInt(productDiv.querySelector('.qty').value);
            let pname = productDiv.querySelector('.product-name').textContent;
            let cartid = parseInt(productDiv.querySelector('.cartid').textContent);

            let req = new XMLHttpRequest();
            req.open('POST', `/updateQty`);
            req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            req.responseType = 'json';
            req.onload = function (evt) {
                if (req.status == 200) { // check for ok response
                    const resp = req.response;
                    console.log(resp);
                    window.location = resp.url;
                }
                else {
                    console.log('err', req);
                }
            };
            let msg = { qty: qty, pname: pname, cartid: cartid };
            console.log('sending', msg);
            req.send(JSON.stringify(msg));
        });

        deleteButton = productDiv.querySelector('.delete');
        deleteButton.addEventListener('click', (evt) => {
            console.log('delete button clicked');

            let pname = productDiv.querySelector('.product-name').textContent;
            let req = new XMLHttpRequest();
            req.open('POST', `/deleteSingleProduct`);
            req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            req.responseType = 'json';
            req.onload = function (evt) {
                if (req.status == 200) { // check for ok response
                    const resp = req.response;
                    window.location = resp.url;
                }
                else {
                    console.log('err', req);
                }
            };
            let msg = { pname: pname };
            req.send(JSON.stringify(msg));
        });
    }
}());