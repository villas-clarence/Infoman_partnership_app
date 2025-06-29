document.addEventListener('DOMContentLoaded', () => {
  fetch('admin_dashboard.php')
    .then(res => res.json())
    .then(data => {
      const registrantsData = document.getElementById('registrantsData');
      const totalRegistrants = document.getElementById('totalRegistrants');
      const growerCount = document.getElementById('growerCount');
      const legacyCount = document.getElementById('legacyCount');

      let grower = 0, legacy = 0;

      data.forEach(row => {
        if (row.package_type === 'Grower Package') grower++;
        else if (row.package_type === 'Legacy Package') legacy++;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${row.full_name}</td>
          <td>${row.email}</td>
          <td>${row.mobile}</td>
          <td>${row.package_type}</td>
          <td>${row.tree_count}</td>
          <td>
            <a href="edit_registration.php?id=${row.registrant_id}" class="edit-btn">Edit</a>
            <a href="delete_registration.php?id=${row.registrant_id}" class="delete-btn">Delete</a>
          </td>
        `;
        registrantsData.appendChild(tr);
      });

      totalRegistrants.textContent = data.length;
      growerCount.textContent = grower;
      legacyCount.textContent = legacy;

      const ctx1 = document.getElementById('packageChart').getContext('2d');
      new Chart(ctx1, {
        type: 'pie',
        data: {
          labels: ['Grower Package', 'Legacy Package'],
          datasets: [{
            data: [grower, legacy],
            backgroundColor: ['#66bb6a', '#ffa726']
          }]
        }
      });

      const ctx2 = document.getElementById('treeCountChart').getContext('2d');
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: data.map(row => row.full_name),
          datasets: [{
            label: 'Tree Count',
            data: data.map(row => row.tree_count),
            backgroundColor: '#42a5f5'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });

      document.getElementById('searchBar').addEventListener('input', function () {
        const keyword = this.value.toLowerCase();
        document.querySelectorAll('#registrantsData tr').forEach(row => {
          row.style.display = row.textContent.toLowerCase().includes(keyword) ? '' : 'none';
        });
      });
    })
    .catch(err => console.error('Error:', err));
});
