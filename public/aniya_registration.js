ener("DOMContentLoaded", () => {
  fetch("admin_dashboard.php")
    .then((res) => {
      console.log("Fetch response status:", res.status);
      return res.json();
    })
    .then((data) => {
      console.log("Fetched data:", data);

      // New code to handle checkout data and pricing for livestocks
      const checkoutDataJSON = localStorage.getItem('checkoutData');
      if (checkoutDataJSON) {
        const checkoutData = JSON.parse(checkoutDataJSON);
        const items = checkoutData.items || [];
        const totalPrice = checkoutData.totalPrice || 0;

        // Prices per animal for livestocks
        const livestockPrices = {
          "Goat Intercropping": 5000,
          "Pig Intercropping": 16000
        };

        // Compute livestock totals and display price per animal
        items.forEach(item => {
          if (item.name === "Goat Intercropping") {
            item.pricePerAnimal = livestockPrices["Goat Intercropping"];
            item.totalCost = item.pricePerAnimal * item.quantity;
          } else if (item.name === "Pig Intercropping") {
            item.pricePerAnimal = livestockPrices["Pig Intercropping"];
            item.totalCost = item.pricePerAnimal * item.quantity;
          }
        });

        // Example: Display the livestock pricing info in the console (to be replaced with UI updates)
      console.log("Checkout Livestock Items with Pricing:", items);

      // Update the frontend UI to display price per animal and totals
      const livestockTotalCostDiv = document.getElementById('livestockTotalCost');
      if (livestockTotalCostDiv) {
        let totalLivestockCost = 0;
        items.forEach(item => {
          if (item.pricePerAnimal && item.quantity) {
            totalLivestockCost += item.pricePerAnimal * item.quantity;
          }
        });
        livestockTotalCostDiv.textContent = `Total Livestock Cost: ₱${totalLivestockCost.toLocaleString()}`;

        // Update combined total cost in the form
        const totalAmountSpan = document.getElementById('totalAmount');
        const totalAmountInput = document.getElementById('totalAmountInput');
        if (totalAmountSpan && totalAmountInput) {
          // Get current package total from the form
          let packageTotal = 0;
          const packageTotalText = totalAmountSpan.textContent.replace(/[^\d]/g, '');
          if (packageTotalText) {
            packageTotal = parseInt(packageTotalText);
          }
          const combinedTotal = packageTotal + totalLivestockCost;
          totalAmountSpan.textContent = `₱${combinedTotal.toLocaleString()}`;
          totalAmountInput.value = combinedTotal;
        }
      }
      }
      const registrants = data.registrants || [];
      const metrics = data.metrics || {};
      const tableBody = document.getElementById("registrantsData");

      // Update metric counts
      const growerCount = metrics.grower || 0;
      const legacyCount = metrics.legacy || 0;
      const cropCount = metrics.crops || 0;
      const livestockCount = metrics.livestock || 0;

      document.getElementById("totalRegistrants").textContent = registrants.length;
      document.getElementById("growerCount").textContent = growerCount;
      document.getElementById("legacyCount").textContent = legacyCount;
      document.getElementById("cropCount").textContent = cropCount;
      document.getElementById("livestockCount").textContent = livestockCount;

      // Clear and populate table
      tableBody.innerHTML = '';
      registrants.forEach((r) => {
        const row = `
          <tr>
            <td>${r.full_name}</td>
            <td>${r.email}</td>
            <td>${r.mobile}</td>
            <td>${r.company_name}</td>
            <td>${r.role}</td>
            <td>${r.package_name || ''}</td>
            <td>${r.tree_count}</td>
            <td>${r.crops || ''}</td>
            <td>${r.livestock || ''}</td>
            <td class="actions">
              <button class="btn btn-sm btn-edit" onclick="editRegistrant(${r.registrant_id})">Edit</button>
              <button class="btn btn-sm btn-delete" onclick="deleteRegistrant(${r.registrant_id})">Delete</button>
            </td>
          </tr>
        `;
        tableBody.insertAdjacentHTML("beforeend", row);
      });

      // Draw Package Distribution Chart
      new Chart(document.getElementById("packageChart"), {
        type: "doughnut",
        data: {
          labels: ["Grower", "Legacy"],
          datasets: [{
            data: [growerCount, legacyCount],
            backgroundColor: ["#66bb6a", "#9575cd"]
          }]
        }
      });

      // Draw Top Tree Count Chart
      const topRegistrants = registrants
        .sort((a, b) => b.tree_count - a.tree_count)
        .slice(0, 5);

      new Chart(document.getElementById("treeCountChart"), {
        type: "bar",
        data: {
          labels: topRegistrants.map(r => r.full_name),
          datasets: [{
            label: "Trees",
            data: topRegistrants.map(r => r.tree_count),
            backgroundColor: "#42a5f5"
          }]
        },
        options: {
          indexAxis: 'y'
        }
      });
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      alert("⚠️ Unable to load data from server.");
    });
});

function editRegistrant(id) {
  window.location.href = `edit_registrants.php?id=${id}`;
}

function deleteRegistrant(id) {
  if (confirm("Are you sure you want to delete this registrant?")) {
    fetch("delete_registrants.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "registrant_id=" + encodeURIComponent(id)
    })
    .then(res => res.json())
    .then(resp => {
      alert(resp.message);
      window.location.reload();
    })
    .catch(err => {
      console.error(err);
      alert("Failed to delete registrant.");
    });
  }
}
