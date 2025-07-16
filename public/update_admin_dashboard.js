document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const tabs = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');
  const userSelect = document.getElementById('userSelect');
  const noteInput = document.getElementById('noteInput');
  const photoInput = document.getElementById('photoInput');
  const remarksInput = document.getElementById('remarksInput');
  const statusSelect = document.getElementById('statusSelect');

  const previewStatus = document.getElementById('previewStatus');
  const previewNote = document.getElementById('previewNote');
  const previewUser = document.getElementById('previewUser');
  const previewRemarks = document.getElementById('previewRemarks');
  const previewImages = document.getElementById('previewImages');

  const updatesList = document.getElementById('updatesList');
  const statusFilter = document.getElementById('statusFilter');

  // 🔄 Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');

      if (tab.dataset.tab === 'manage') {
        fetchUpdates();
      }
    });
  });

  // 🧠 Live Preview
  userSelect.addEventListener('change', () => {
    const selectedOption = userSelect.options[userSelect.selectedIndex];
    previewUser.textContent = selectedOption.text || '—';
  });

  noteInput.addEventListener('input', () => {
    previewNote.textContent = noteInput.value || '—';
  });

  statusSelect.addEventListener('change', () => {
    previewStatus.textContent = statusSelect.value;
  });

  remarksInput.addEventListener('input', () => {
    previewRemarks.textContent = remarksInput.value || '—';
  });

  photoInput.addEventListener('change', () => {
    previewImages.innerHTML = '';
    Array.from(photoInput.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '80px';
        img.style.marginRight = '10px';
        previewImages.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // 📤 Submit Form
  document.getElementById('updateForm').addEventListener('submit', e => {
    e.preventDefault();

    const userId = userSelect.value;
    const note = noteInput.value;
    const status = statusSelect.value;
    const remarks = remarksInput.value;

    if (!userId || !note) {
      alert('Please select a user and write a note.');
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('note', note);
    formData.append('status', status);
    formData.append('remarks', remarks);

    Array.from(photoInput.files).forEach(photo => {
      formData.append('photos[]', photo);
    });

    fetch('save_update_admin.php', {
      method: 'POST',
      body: formData
    })
      .then(res => res.text())
      .then(data => {
        alert('Update saved successfully!');
        document.getElementById('updateForm').reset();
        previewUser.textContent = '—';
        previewNote.textContent = '—';
        previewRemarks.textContent = '—';
        previewImages.innerHTML = '';
        fetchUpdates();
      })
      .catch(err => {
        console.error('Error:', err);
        alert('Failed to save update.');
      });
  });

  // 📥 Load Registrants into Select
  function fetchUsers() {
    fetch('get_registrants.php')
      .then(res => res.json())
      .then(data => {
        userSelect.innerHTML = '<option value="">-- Select a registrant --</option>';
        data.forEach(user => {
          const opt = document.createElement('option');
          opt.value = user.registrant_id;
          opt.textContent = `${user.full_name} (${user.custom_id})`;
          userSelect.appendChild(opt);
        });
      });
  }

  // 📦 Fetch Updates
  function fetchUpdates() {
    const status = statusFilter.value;

    let url = 'get_updates.php';
    if (status !== 'all') {
      url += `?status=${encodeURIComponent(status)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        updatesList.innerHTML = '';
        if (data.length === 0) {
          updatesList.innerHTML = '<p>No updates found for selected status.</p>';
          return;
        }

        data.forEach(update => {
          const card = document.createElement('div');
          card.classList.add('update-card');
          card.innerHTML = `
            <h4>${update.full_name} (${update.custom_id})</h4>
            <p><strong>Status:</strong> ${update.status}</p>
            <p><strong>Note:</strong> ${update.notes}</p>
            <p><strong>Date:</strong> ${update.update_date}</p>
            <p><strong>Remarks:</strong> ${update.remarks || '—'}</p>
            <div class="update-photos">
              ${(JSON.parse(update.photo_urls || '[]')).map(url => `<img src="${url}" alt="photo" style="max-width:80px; margin-right:5px;">`).join('')}
            </div>
          `;
          updatesList.appendChild(card);
        });
      })
      .catch(err => {
        console.error('Fetch error:', err);
        updatesList.innerHTML = '<p>Error fetching updates.</p>';
      });
  }

  statusFilter.addEventListener('change', fetchUpdates);

  // ⏱️ Last sync time
  document.getElementById('lastSyncTime').textContent = new Date().toLocaleString();

  // Initial Load
  fetchUsers();
});
