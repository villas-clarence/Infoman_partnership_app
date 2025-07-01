function logout() {
    if (confirm("Are you sure you want to log out?")) {
        alert("You have been logged out.");
        window.location.href = "login.html"; // Adjust to your login page URL
    }
}

const countdownEl = document.getElementById("countdown");
const harvestDate = new Date("2025-12-01T00:00:00").getTime();

const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = harvestDate - now;
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownEl.innerHTML = distance < 0
        ? "🌟 Coffee beans are ready!"
        : `${days}d ${hours}h ${minutes}m ${seconds}s`;
}, 1000);

async function fetchPartners() {
    const res = await fetch("partnership.php");
    const data = await res.json();
    return data;
}

// Farm Updates Chart
let farmUpdatesChart;
function renderFarmUpdatesChart() {
    const ctx = document.getElementById("farmUpdatesChart").getContext("2d");
    if (farmUpdatesChart) farmUpdatesChart.destroy(); // Destroy existing chart to prevent overlap
    farmUpdatesChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Sprouting Stage", "Growing Strong"],
            datasets: [{
                label: "Progress (%)",
                data: [30, 70], // Hypothetical progress percentages
                backgroundColor: ["#6bcf6b", "#2e8b57"],
                borderColor: ["#ffffff", "#ffffff"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: "Progress (%)"
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Tree Name Chart
let treeNameChart;
async function renderTreeNameChart() {
    const data = await fetchPartners();
    const ctx = document.getElementById("treeNameChart").getContext("2d");
    if (treeNameChart) treeNameChart.destroy(); // Destroy existing chart to prevent overlap

    // Count occurrences of each tree name
    const nameCounts = data.reduce((acc, row) => {
        acc[row.user_name] = (acc[row.user_name] || 0) + 1;
        return acc;
    }, {});
    const labels = Object.keys(nameCounts);
    const counts = Object.values(nameCounts);

    treeNameChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels.length > 0 ? labels : ["No Trees"],
            datasets: [{
                data: counts.length > 0 ? counts : [1],
                backgroundColor: labels.length > 0 ? ["#6bcf6b", "#2e8b57", "#4caf50"] : ["#ccc"]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "right"
                }
            }
        }
    });

    document.getElementById("treePartnerName").textContent = data.length > 0 ? data[0].user_name : "Tree Partner";
}

async function submitPartner() {
    const name = document.getElementById("partnerName").value.trim();
    if (!name) return alert("Please enter a name.");
    const formData = new FormData();
    formData.append("action", "create");
    formData.append("user_name", name);
    const res = await fetch("partnership.php", {
        method: "POST",
        body: formData
    });
    const result = await res.json();
    if (result.success) {
        document.getElementById("partnerName").value = "";
        renderTreeNameChart();
    } else {
        alert(result.error);
    }
}

// Initialize charts
renderFarmUpdatesChart();
renderTreeNameChart();