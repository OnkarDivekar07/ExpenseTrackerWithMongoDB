const form = document.querySelector('#form');
const button = document.getElementById('button');
let currentPage = 1;
const itemsPerPage = 5;
let data;

form.addEventListener('submit', saveExpense);

async function saveExpense(event) {
    event.preventDefault();
    const amount = event.target.amount.value;
    const description = event.target.description.value;
    const catogary = event.target.catogary.value;

    const expenseData = {
        amount,
        description,
        catogary,
    };

    try {
        const token = localStorage.getItem('token');
        const res = await axios.post('/expense/postexpense', expenseData, { headers: { "Authorization": token } });
        buttons(res.data);
    } catch (error) {
        console.error(error);
    }
}
function displayItemsForPage(data, page) {
    const startIdx = (page - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const itemsToDisplay = data.slice(startIdx, endIdx);

    userTableBody.innerHTML = '';

    itemsToDisplay.forEach((item) => {
        buttons(item);
    });
}
function updatePaginationControls(data) {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
}

function buttons(responsedata) {
    const row = document.createElement('tr');

    const createdAtDate = new Date(responsedata.createdAt);
    const formattedDate = createdAtDate.toLocaleDateString();

    const dateCell = document.createElement('td');
    dateCell.textContent = formattedDate;
    row.appendChild(dateCell);

    const amountCell = document.createElement('td');
    amountCell.textContent = responsedata.amount;
    row.appendChild(amountCell);

    const descriptionCell = document.createElement('td');
    descriptionCell.textContent = responsedata.description;
    row.appendChild(descriptionCell);

    const categoryCell = document.createElement('td');
    categoryCell.textContent = responsedata.catogary;
    row.appendChild(categoryCell);

    const actionCell = document.createElement('td');

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-secondary';
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = () => {
        const deleteid = responsedata.id;
        const token = localStorage.getItem('token');
        axios.delete(`/expense/deleteexpense/${deleteid}`, { headers: { "Authorization": token } })
            .then((response) => {
            })
            .catch((err) => {
                console.log(err);
            });
        userTableBody.removeChild(row);
    };

    actionCell.appendChild(deleteButton);
    row.appendChild(actionCell);
    userTableBody.appendChild(row);
}

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}


window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem('token');
    const decodedtoken = parseJwt(token);
    try {
        let res = await axios.get('/expense/getexpenses', { headers: { "Authorization": token } });
        data = res.data;

        const totalPages = Math.ceil(data.length / itemsPerPage);
        updatePaginationControls(data, currentPage, totalPages);

        displayItemsForPage(data, currentPage, itemsPerPage);

        document.getElementById('nextPageButton').addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayItemsForPage(data, currentPage, itemsPerPage);
                updatePaginationControls(data, currentPage, totalPages);
            }
        });

        document.getElementById('prevPageButton').addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayItemsForPage(data, currentPage, itemsPerPage);
                updatePaginationControls(data, currentPage, totalPages);
            }
        });
    } catch (error) {
        console.log(error);
    }
});



document.getElementById('nextPageButton').addEventListener('click', () => {
    const token = localStorage.getItem('token');
    const decodedtoken = parseJwt(token);
    const ispremiumuser = decodedtoken.ispremiumuser;

    if (currentPage < totalPages) {
        currentPage++;
        displayItemsForPage(data, currentPage);
        updatePaginationControls(data);
    }
});

document.getElementById('prevPageButton').addEventListener('click', () => {
    const token = localStorage.getItem('token');
    const decodedtoken = parseJwt(token);
    const ispremiumuser = decodedtoken.ispremiumuser;

    if (currentPage > 1) {
        currentPage--;
        displayItemsForPage(data, currentPage);
        updatePaginationControls(data);
    }
});