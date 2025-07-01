document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_dashboard.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('registrantsData');
      const totalCount = document.getElementById('totalCount');
      const growerCount = document.getElementById('growerCount');
      const legacyCount = document.getElementById('legacyCount');
      let grower = 0, legacy = 0;

      tbody.innerHTML = '';

      data.forEach(row => {
        if (row.package_type === 'Grower Package') grower++;
        else if (row.package_type === 'Legacy Package') legacy++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.mobile}</td>
          <td>${row.package_type || ''}</td>
          <td>${row.tree_count || 0}</td>
          <td>
            <button class="btn edit-btn" data-id="${row.registrant_id}">Edit</button>
            <button class="btn delete-btn" data-id="${row.registrant_id}">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      totalCount.textContent = data.length;
      growerCount.textContent = grower;
      legacyCount.textContent = legacy;

      new Chart(document.getElementById('packageChart'), {
        type: 'pie',
        data: {
          labels: ['Grower', 'Legacy'],
          datasets: [{ data: [grower, legacy], backgroundColor: ['#66bb6a', '#ffa726'] }]
        }
      });

      new Chart(document.getElementById('treeChart'), {
        type: 'bar',
        data: {
          labels: data.map(row => row.full_name),
          datasets: [{
            label: 'Tree Count',
            data: data.map(row => row.tree_count || 0),
            backgroundColor: '#42a5f5'
          }]
        },
        options: {
          scales: { y: { beginAtZero: true } }
        }
      });

      // Search logic
      const search = document.getElementById('searchBar');
      search.addEventListener('input', () => {
        const value = search.value.toLowerCase();
        document.querySelectorAll('#registrantsData tr').forEach(row => {
          const match = row.textContent.toLowerCase().includes(value);
          row.style.display = match ? '' : 'none';
          row.style.backgroundColor = match && value ? '#fff8dc' : '';
        });
      });

      // Edit logic
      document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          const row = e.target.closest('tr');
          const modal = document.getElementById('editModal');
          const form = document.getElementById('editForm');
          const cells = row.querySelectorAll('td');
          form.registrant_id.value = btn.dataset.id;
          form.full_name.value = cells[0].textContent;
          form.email.value = cells[1].textContent;
          form.mobile.value = cells[2].textContent;
          form.company_name.value = cells[3]?.textContent || '';
          form.role.value = cells[4]?.textContent || '';
          form.package_type.value = cells[3]?.textContent || '';
          form.tree_count.value = cells[4]?.textContent || cells[5]?.textContent || 0;
          modal.style.display = 'flex';
        });
      });

      // Submit edit
      document.getElementById('editForm').addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(e.target);
        fetch('update_registrants.php', {
          method: 'POST',
          body: formData
        })
        .then(res => res.json())
        .then(res => {
          if (res.success) location.reload();
          else alert('Update failed: ' + (res.error || 'Unknown error'));
        });
      });

      // Delete logic
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          if (confirm('Delete this registrant?')) {
            fetch('delete_registrants.php', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'registrant_id=' + btn.dataset.id
            })
            .then(res => res.json())
            .then(res => {
              if (res.success) location.reload();
              else alert('Delete failed: ' + (res.error || 'Unknown error'));
            });
          }
        });
      });
    });
});
