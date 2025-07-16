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
      const treeCount = document.getElementById('treeCount');

      const registrants = data.registrants || [];
      const metrics = data.metrics || {};

      let grower = metrics.grower || 0;
      let legacy = metrics.legacy || 0;

      tbody.innerHTML = '';

      registrants.forEach(row => {
        const tr = document.createElement('tr');
        const paymentReceiptCell = row.payment_proof
          ? `<a href="${row.payment_proof}" target="_blank" rel="noopener noreferrer">View Receipt</a>`
          : 'No Receipt';
        tr.innerHTML = `
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.mobile}</td>
          <td>${row.company_name || ''}</td>
          <td>${row.role || ''}</td>
          <td data-package-id="${row.package_id || 0}">${row.package_name || ''}</td>
          <td>${row.tree_count || 0}</td>
          <td>${row.crops || ''}</td>
          <td>${row.livestock || ''}</td>
          <td>${paymentReceiptCell}</td>
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

      // Fix: Update treeCount element with total tree count
      let totalTreeCount = 0;
      if (typeof metrics.tree === 'number') {
        totalTreeCount = metrics.tree;
      } else {
        totalTreeCount = registrants.reduce((sum, r) => sum + (r.tree_count || 0), 0);
      }
      treeCount.textContent = totalTreeCount;

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

      // ... rest of the code unchanged ...
    });
});
