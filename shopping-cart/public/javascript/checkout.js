const proceedButton = document.getElementById('proceed');

proceedButton.addEventListener('click', (evt) => {
    let fname = document.getElementById('card-holder-fname').value;
    let lname = document.getElementById('card-holder-lname').value;
    let email = document.getElementById('card-holder-email').value;
    let phone = document.getElementById('card-holder-phone').value;
    let cardnum = document.getElementById('card-holder').value;
    let expMM = document.getElementById('MM').value;
    let expYY = document.getElementById('YY').value;
    let cvc = document.getElementById('cvc').value;
    if (fname==""||lname==""||email==""||phone==""||cardnum==""||expMM==""||expYY==""||cvc=="") {
        window.alert("Please fill out all the blanks");
        return;
    }

    let req = new XMLHttpRequest();
    req.open('DELETE', `/checkoutsuccessfully`);
    req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    req.responseType = 'json';
    req.onload = function (evt) {
        if (req.status == 200) { // check for ok response
            const resp = req.response;
            console.log(resp.status);
        }
        else {
            console.log('err', req);
        }
    };
    req.send();
    window.location.href = '/thankyou';
});
