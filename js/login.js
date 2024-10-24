document.getElementById('loginForm').addEventListener('submit', async function (event) {
    localStorage.clear();
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    console.log('username:', username, 'password:', password);

    try {
        const response = await fetch('https://wom-projekt-ezgcbya0hfdthsby.westeurope-01.azurewebsites.net/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            console.log(data.message);
            console.log("Token: ", data.token);
            localStorage.setItem('token', data.token);

            window.location.href = '/boards.html'; 
        } else {
            alert(data.message);
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
});
