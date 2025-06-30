document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_dashboard.php')
    .then(res => res.json())
    .then(data => {
      const { registrants, counts } = data;
      const registrantsData = document.getElementById('registrantsData');
      const totalRegistrants = document.getElementById('totalRegistrants');
      const growerCount = document.getElementById('growerCount');
      const legacyCount = document.getElementById('legacyCount');
      const cropCount = document.getElementById('cropCount');
      const livestockCount = document.getElementById('livestockCount');
      const paymentCount = document.getElementById('paymentCount');

      totalRegistrants.textContent = registrants.length;
      growerCount.textContent = counts.grower;
      legacyCount.textContent = counts.legacy;
      cropCount.textContent = counts.crops;
      livestockCount.textContent = counts.livestock;
      paymentCount.textContent = counts.payments;

      registrants.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.mobile}</td>
          <td>${row.package_type}</td>
          <td>${row.tree_count || 0}</td>
          <td>
            <a href="edit_registration.php?id=${row.registrant_id}" class="edit-btn">Edit</a>
            <a href="delete_registration.php?id=${row.registrant_id}" class="delete-btn">Delete</a>
          </td>
        `;
        registrantsData.appendChild(tr);
      });

      // Chart: Package Distribution
      new Chart(document.getElementById('packageChart').getContext('2d'), {
        type: 'pie',
        data: {
          labels: ['Grower Package', 'Legacy Package'],
          datasets: [{
            data: [counts.grower, counts.legacy],
            backgroundColor: ['#66bb6a', '#ffa726']
          }]
        }
      });

      // Chart: Tree Count
      new Chart(document.getElementById('treeCountChart').getContext('2d'), {
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
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });

      // Search functionality
      document.getElementById('searchBar').addEventListener('input', function () {
        const keyword = this.value.toLowerCase();
        document.querySelectorAll('#registrantsData tr').forEach(row => {
          const match = row.textContent.toLowerCase().includes(keyword);
          row.style.display = match ? '' : 'none';
          row.style.backgroundColor = match && keyword !== '' ? '#ffff99' : '';
        });
      });

      // Export to Excel
      document.getElementById('exportExcel').addEventListener('click', () => {
        const wb = XLSX.utils.book_new();
        const wsData = [
          ['Name', 'Email', 'Mobile', 'Package', 'Tree Count'],
          ...registrants.map(row => [row.full_name, row.email, row.mobile, row.package_type, row.tree_count || 0])
        ];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Registrants');
        XLSX.writeFile(wb, 'registrants.xlsx');
      });
    })
    .catch(err => console.error('Fetch error:', err));
});

