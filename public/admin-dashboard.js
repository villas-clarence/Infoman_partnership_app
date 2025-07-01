document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_dashboard.php')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('registrantsData');
      const totalCount = document.getElementById('totalRegistrants');
      const growerCount = document.getElementById('growerCount');
      const legacyCount = document.getElementById('legacyCount');
      const cropCount = document.getElementById('cropCount');
      const livestockCount = document.getElementById('livestockCount');

      const registrants = data.registrants || [];
      const metrics = data.metrics || {};

      let grower = metrics.grower || 0;
      let legacy = metrics.legacy || 0;

      tbody.innerHTML = '';

      registrants.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.mobile}</td>
          <td>${row.company_name || ''}</td>
          <td>${row.role || ''}</td>
          <td>${row.package_name || ''}</td>
          <td>${row.tree_count || 0}</td>
          <td>${row.crops || ''}</td>
          <td>${row.livestock || ''}</td>
          <td>
            <button class="btn edit-btn" data-id="${row.registrant_id}">Edit</button>
            <button class="btn delete-btn" data-id="${row.registrant_id}">Delete</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      totalCount.textContent = registrants.length;
      growerCount.textContent = grower;
      legacyCount.textContent = legacy;
      cropCount.textContent = metrics.crops || 0;
      livestockCount.textContent = metrics.livestock || 0;

      new Chart(document.getElementById('packageChart'), {
        type: 'pie',
        data: {
          labels: ['Grower', 'Legacy'],
          datasets: [{ data: [grower, legacy], backgroundColor: ['#66bb6a', '#ffa726'] }]
        }
      });

      new Chart(document.getElementById('treeCountChart'), {
        type: 'bar',
        data: {
          labels: registrants.map(row => row.full_name),
          datasets: [{
            label: 'Tree Count',
            data: registrants.map(row => row.tree_count || 0),
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
          form.package_name.value = cells[5]?.textContent || '';
          form.tree_count.value = cells[6]?.textContent || 0;
          form.crops.value = cells[7]?.textContent || '';
          form.livestock.value = cells[8]?.textContent || '';
          modal.style.display = 'flex';
        });
      });

      // Cancel edit modal
      document.getElementById('cancelEdit').addEventListener('click', () => {
        const modal = document.getElementById('editModal');
        modal.style.display = 'none';
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
          if (res.success) {
            alert('Registrant updated successfully');
            const modal = document.getElementById('editModal');
            modal.style.display = 'none';
            location.reload();
          } else {
            alert('Update failed: ' + (res.error || 'Unknown error'));
          }
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
