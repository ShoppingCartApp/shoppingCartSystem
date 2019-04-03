(function () {
    let deleteButton = document.getElementById("singleDelete");
    let updateButton = document.getElementById('update');

    updateButton.addEventListener('click', (evt) => {
        console.log('Update button click');
        let qty = parseInt(document.getElementById("qty").value);
        let pname = document.getElementById("product_name").textContent;
        let cartid = document.getElementById('cartid').textContent;
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

    deleteButton.addEventListener('click', (evt) => {
        console.log("clicked delete button");
        let pname = document.getElementById("product_name").textContent;
        let qty = parseInt(document.getElementById("qty").value);
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
        let msg = { pname: pname, qty: qty };
        req.send(JSON.stringify(msg));
    });
}());