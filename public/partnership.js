const modal = document.getElementById('popupModal');
const popupMessage = document.getElementById('popupMessage');
const closeModalBtn = document.getElementById('closeModal');
const form = document.getElementById('partnershipForm');
const input = document.getElementById('userNameInput');
const tbody = document.querySelector('#partnershipTable tbody');

closeModalBtn.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
function showPopup(msg) {
  popupMessage.textContent = msg;
  modal.style.display = 'block';
}

function fetchPartnerships() {
  fetch('partnership.php')
    .then(res => res.json())
    .then(data => {
      tbody.innerHTML = '';
      data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        row.innerHTML = `
          <td>${item.id}</td>
          <td contenteditable="false">${item.user_name}</td>
          <td>
            <button class="edit-btn">Edit</button>
            <button class="delete-btn">Delete</button>
          </td>
        `;
        row.querySelector('.edit-btn').onclick = () => enableEdit(row);
        row.querySelector('.delete-btn').onclick = () => deleteEntry(item.id);
        tbody.appendChild(row);
      });
    });
}

function enableEdit(row) {
  const nameCell = row.children[1];
  nameCell.contentEditable = true;
  nameCell.focus();
  const actionCell = row.children[2];
  actionCell.innerHTML = '';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.className = 'save-btn';
  saveBtn.onclick = () => saveEdit(row);
  actionCell.appendChild(saveBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.className = 'cancel-btn';
  cancelBtn.onclick = fetchPartnerships;
  actionCell.appendChild(cancelBtn);
}

function saveEdit(row) {
  const id = row.dataset.id;
  const newName = row.children[1].textContent.trim();
  if (!newName) return showPopup('Name cannot be empty.');

  const formData = new FormData();
  formData.append('action', 'update');
  formData.append('id', id);
  formData.append('user_name', newName);

  fetch('partnership.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showPopup(data.success);
        fetchPartnerships();
      } else {
        showPopup(data.error);
      }
    });
}

function deleteEntry(id) {
  if (!confirm('Delete this entry?')) return;

  const formData = new FormData();
  formData.append('action', 'delete');
  formData.append('id', id);

  fetch('partnership.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showPopup(data.success);
        fetchPartnerships();
      } else {
        showPopup(data.error);
      }
    });
}

form.onsubmit = function (e) {
  e.preventDefault();
  const name = input.value.trim();
  if (!name) return showPopup('Name is required.');

  const formData = new FormData();
  formData.append('action', 'create');
  formData.append('user_name', name);

  fetch('partnership.php', { method: 'POST', body: formData })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showPopup(data.success);
        input.value = '';
        fetchPartnerships();
      } else {
        showPopup(data.error);
      }
    });
};

fetchPartnerships();
