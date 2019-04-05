let req = new XMLHttpRequest(); 

req.open('GET', '/checkAdmin');
req.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
req.responseType = 'json';
req.onload = function(evt) { 
    let res = req.response;
    if(res.ok){
        $('#admindd').show();

    }
    else{
        return
    }
}
req.send();