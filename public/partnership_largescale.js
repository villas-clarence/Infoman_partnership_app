document.addEventListener('DOMContentLoaded', () => {
    function showTab(tabName) {
        const tabs = document.querySelectorAll('.tab-content');
        tabs.forEach(tab => tab.classList.add('hidden'));

        const buttons = document.querySelectorAll('.sidebar-btn');
        buttons.forEach(btn => {
            btn.classList.remove('bg-green-800', 'text-white', 'shadow-lg', 'hover:bg-green-900');
            btn.classList.add('text-gray-700', 'hover:bg-gray-100');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });

        const activeTab = document.getElementById(tabName + '-tab');
        if (activeTab) activeTab.classList.remove('hidden');

        const activeBtn = document.getElementById(tabName + '-btn');
        if (activeBtn) {
            activeBtn.classList.add('bg-green-800', 'text-white', 'shadow-lg', 'hover:bg-green-900');
            activeBtn.classList.remove('text-gray-700', 'hover:bg-gray-100');
            activeBtn.setAttribute('aria-selected', 'true');
            activeBtn.setAttribute('tabindex', '0');
            activeBtn.focus();
        }
    }

    window.showTab = showTab;
    showTab('overview');

    // Fetch registrant data from localStorage
    const registrantData = JSON.parse(localStorage.getItem('editRegistrant'));
    if (registrantData) {
        const registrantId = registrantData.registrant_id;
        const customId = registrantData.custom_id;

        // Set registrantId input
        document.getElementById('registrantIdInput').value = registrantId;

        // Show unique custom ID
        document.getElementById('uniqueIdDisplay').textContent = `Your Unique ID: ${customId}`;

        // Fetch tree names
        getTreeNames(registrantId);
    }
});

// Add Tree Name
function addTreeName(treeName, registrantId) {
    fetch('php/partnership_smallscale.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'addTreeName',
            treeName: treeName,
            registrantId: registrantId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('treeNameInput').value = '';
            getTreeNames(registrantId);
        } else {
            alert('Error: ' + (data.error || 'Unknown error'));
        }
    })
    .catch(err => alert('Network error: ' + err));
}

// Get Tree Names
function getTreeNames(registrantId) {
    fetch('php/partnership_smallscale.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'getTreeNames',
            registrantId: registrantId
        })
    })
    .then(response => response.json())
    .then(treeNames => {
        const list = document.getElementById('treeNameList');
        list.innerHTML = '';
        treeNames.forEach(tree => {
            const li = document.createElement('li');
            li.innerHTML = `
                🌱 <span id="tree-name-${tree.id}">${tree.name}</span>
                <button onclick="editTreePrompt(${tree.id}, ${registrantId}, '${tree.name.replace(/'/g, "\\'")}')">✏️</button>
                <button onclick="deleteTreeName(${tree.id}, ${registrantId})">🗑️</button>
            `;
            list.appendChild(li);
        });
    });
}

// Edit Tree Name Prompt
function editTreePrompt(treeId, registrantId, oldName) {
    const newName = prompt('Edit tree name:', oldName);
    if (newName && newName.trim() !== '' && newName !== oldName) {
        updateTreeName(treeId, registrantId, newName.trim());
    }
}

// Update Tree Name
function updateTreeName(treeId, registrantId, newName) {
    fetch('php/partnership_smallscale.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'editTreeName',
            id: treeId,
            registrantId: registrantId,
            newName: newName
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            getTreeNames(registrantId);
        } else {
            alert('Failed to update: ' + (data.error || 'Unknown error'));
        }
    });
}

// Soft Delete Tree Name
function deleteTreeName(treeId, registrantId) {
    if (!confirm('Are you sure you want to delete this tree name?')) return;

    fetch('php/partnership_smallscale.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            action: 'softDeleteTreeName',
            id: treeId,
            registrantId: registrantId
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            getTreeNames(registrantId);
        } else {
            alert('Failed to delete: ' + (data.error || 'Unknown error'));
        }
    });
}

// Handle Tree Name Form Submission
document.getElementById('addTreeNameForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const treeName = document.getElementById('treeNameInput').value.trim();
    const registrantId = document.getElementById('registrantIdInput').value;

    if (treeName && registrantId) {
        addTreeName(treeName, registrantId);
    } else {
        alert("Please provide a tree name and valid registrant ID.");
    }
});
