const email = document.getElementById('email');
const form = document.getElementById('form');

form.addEventListener('submit', postemail);

function postemail(e) {
    e.preventDefault();
    const userEmail = {
        email: email.value
    };

    axios.post('/password/forgotpassword', userEmail)
        .then(response => {
            if (response.status === 202) {
                document.body.innerHTML += '<div style="color:green;">Mail Successfully sent, please check your inbox<div>';
            } else {
                throw new Error('Something went wrong!!!');
            }
        })
        .catch(err => {
            document.body.innerHTML += `<div style="color:red;">${err} <div>`;
        });
}