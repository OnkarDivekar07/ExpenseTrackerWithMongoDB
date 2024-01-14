document.addEventListener("DOMContentLoaded", function () {
    showLeaderboard();
});


function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}
async function showLeaderboard() {
    const token = localStorage.getItem('token');
    const decodedtoken = parseJwt(token)
    const response = await axios.get('/expense/leaderboard', {
        headers: {
            "Authorization": token
        }
    });

    if (decodedtoken.ispremiumuser == null) {
        alert("please buy membership to acess a leaderbord")
    }
    else {
        displayLeaderboard(response.data);
    }
}

function displayLeaderboard(leaderboardData) {
    const leaderboardSection = document.getElementById('leaderboard');
    leaderboardSection.innerHTML = '';

    const leaderboardTable = document.createElement('table');
    leaderboardTable.className = 'table table-bordered table-striped';

    const tableHeader = document.createElement('thead');

    tableHeader.innerHTML = `
            <br>
            <h1>Leadrborad</h1>
                <tr>
                    <th>Name</th>
                    <th>Total Expenses</th>
                </tr>
            `;
    leaderboardTable.appendChild(tableHeader);

    const tableBody = document.createElement('tbody');
    leaderboardData.forEach((user) => {
        const userRow = document.createElement('tr');
        userRow.innerHTML = `
                    <td>${user.Name}</td>
                    <td>${user.totalExpenses === null ? 0 : user.totalExpenses}</td>
                `;
        tableBody.appendChild(userRow);
    });

    leaderboardTable.appendChild(tableBody);

    leaderboardSection.appendChild(leaderboardTable);
}