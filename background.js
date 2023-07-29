const lc_api = 'https://leetcode-stats-api.herokuapp.com/';

function set_to_ls(users) {
  return new Promise((resolve) => {
    const obj = { lc_users: users };
    chrome.storage.sync.set(obj, () => resolve());
  });
}

async function enter_user(user) {
  const { lc_users } = await new Promise((resolve) => {
    chrome.storage.sync.get('lc_users', (items) => resolve(items));
  });
  
  const users = lc_users || [];
  if (!users.includes(user)) {
    users.push(user);
    await set_to_ls(users);
    render_table_row(user);
  }
}

function delete_user(event) {
  const user = event.target.getAttribute('data-field');
  console.log("DELETE: " + user);
  chrome.storage.sync.get('lc_users', async (items) => {
    const users = items.lc_users || [];
    if (users.includes(user)) {
      const updatedUsers = users.filter(e => e !== user);
      await set_to_ls(updatedUsers);
      document.getElementById(user).remove();
    }
  });
}
function createTableRow(user, jsdata) {
    const row = document.createElement("tr");
    row.setAttribute("id", user);
  
    const c0 = document.createElement("td");
    const a = document.createElement("a");
    a.textContent = user;
    a.href = "https://leetcode.com/".concat(user);
    a.target = "_blank";
    c0.appendChild(a);
    row.appendChild(c0);
  
    const c1 = document.createElement("td");
    c1.textContent = jsdata.easySolved;
    row.appendChild(c1);
  
    const c2 = document.createElement("td");
    c2.textContent = jsdata.mediumSolved;
    row.appendChild(c2);
  
    const c3 = document.createElement("td");
    c3.textContent = jsdata.hardSolved;
    row.appendChild(c3);
  
    const c4 = document.createElement("td");
    c4.textContent = jsdata.totalSolved;
    row.appendChild(c4);
  
    const c6 = document.createElement("td");
    c6.textContent = jsdata.ranking;
    row.appendChild(c6);
  
    const c5 = document.createElement("td");
    const btn = document.createElement("button");
    btn.innerHTML = "Delete";
    btn.classList.add("btn", "btn-danger", "btn-sm", "btn-rounded", "delete-btn");
    btn.setAttribute("data-field", user);
    btn.setAttribute("type", "button");
    btn.onclick = delete_user;
    c5.appendChild(btn);
    row.appendChild(c5);
  
    return row;
  }
  
  

async function render_table_row(user) {
  try {
    const rsp = await fetch(lc_api + user);
    const jsdata = await rsp.json();
    const table = document.getElementById('tableBody');
    const row = createTableRow(user, jsdata);
    table.appendChild(row);
  } catch (err) {
    throw err;
  }
}

document.getElementById('add-user-btn').addEventListener('click', async (event) => {
  const input = document.getElementById('add-user-input');
  await enter_user(input.value);
  input.value = "";
});

$(document).ready(async function () {
  try {
    const { lc_users } = await new Promise((resolve) => {
      chrome.storage.sync.get(['lc_users'], (items) => resolve(items));
    });
    const users = lc_users || [];
    for (const user of users) {
      await render_table_row(user);
    }
  } catch (err) {
    console.error(err);
  }
});
