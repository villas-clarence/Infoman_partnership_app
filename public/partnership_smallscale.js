document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Tabs ---
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

        const activeTab = document.getElementById(`${tabName}-tab`);
        if (activeTab) activeTab.classList.remove('hidden');

        const activeBtn = document.getElementById(`${tabName}-btn`);
        if (activeBtn) {
            activeBtn.classList.add('bg-green-800', 'text-white', 'shadow-lg', 'hover:bg-green-900');
            activeBtn.classList.remove('text-gray-700', 'hover:bg-gray-100');
            activeBtn.setAttribute('aria-selected', 'true');
            activeBtn.setAttribute('tabindex', '0');
        }
    }

    window.showTab = showTab;
    showTab('overview');

    // --- Fetch & Display Registrants ---
    function fetchRegistrants() {
        fetch('fetch_dashboard_data.php')
            .then(res => res.json())
            .then(data => {
                const growerList = document.getElementById('grower-list');
                const legacyList = document.getElementById('legacy-list');
                growerList.innerHTML = '';
                legacyList.innerHTML = '';

                data.forEach(reg => {
                    const card = document.createElement('div');
                    card.className = 'bg-white shadow-md rounded-lg p-4 mb-4';
                    card.innerHTML = `
                        <h4 class="text-lg font-semibold">${reg.full_name}</h4>
                        <p><strong>ID:</strong> ${reg.custom_id}</p>
                        <p><strong>Email:</strong> ${reg.email}</p>
                        <p><strong>Mobile:</strong> ${reg.mobile}</p>
                    `;
                    (reg.custom_id.startsWith('ANIYA-GW') ? growerList : legacyList).appendChild(card);
                });
            })
            .catch(err => console.error('Fetch error:', err));
    }

    fetchRegistrants();

    // --- Tree Name Logic ---
    function fetchRegistrantProfile() {
        fetch('php/get_registrant_profile.php')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.custom_id) {
                    document.getElementById('uniqueId').textContent = data.custom_id;
                    window.registrantId = data.registrant_id;

                    if (data.certificate_name) {
                        document.getElementById('treePartnerName').textContent = data.certificate_name;
                    }

                    if (window.registrantId > 0) {
                        fetchTreeNames(window.registrantId);
                    }
                } else {
                    console.error('Failed to fetch registrant profile:', data.error || 'Unknown error');
                    document.getElementById('uniqueId').textContent = 'N/A';
                }
            })
            .catch(err => {
                console.error('Failed to fetch registrant profile:', err);
                document.getElementById('uniqueId').textContent = 'N/A';
            });
    }

    fetchRegistrantProfile();

    document.getElementById('partnerName').addEventListener('keypress', e => {
        if (e.key === 'Enter') submitPartner();
    });

    window.submitPartner = function () {
        const input = document.getElementById('partnerName');
        const name = input.value.trim();
        if (!name) {
            alert('Tree name is missing.');
            return;
        }
        if (!window.registrantId || window.registrantId <= 0) {
            alert('User is missing or not logged in.');
            return;
        }

        addTreeName(name, window.registrantId)
            .then(() => {
                input.value = '';
                fetchTreeNames(window.registrantId);
            })
            .catch(err => {
                console.error('Failed to add tree name:', err);
                alert('Failed to add tree name: ' + err.message);
            });
    };

    const addTreeNameButton = document.getElementById('addTreeNameButton');
    if (addTreeNameButton) {
        addTreeNameButton.addEventListener('click', () => {
            submitPartner();
        });
    }

    function addTreeName(name, rid) {
        return fetch('php/partnership_smallscale.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ action: 'addTreeName', treeName: name, registrantId: rid })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                fetchTreeNames(rid);
            } else {
                throw new Error(data.error || 'Unknown error');
            }
        });
    }

    function fetchTreeNames(rid) {
        fetch('php/partnership_smallscale.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ action: 'getTreeNames', registrantId: rid })
        })
        .then(res => res.json())
        .then(data => {
            renderTreeNames(data, rid);
            if (data.length > 0) {
                updateTreePartnerName(data[0].name);
            }
        })
        .catch(err => console.error('Fetch tree names error:', err));
    }

    function updateTreePartnerName(name) {
        const treePartnerNameElem = document.getElementById('treePartnerName');
        if (treePartnerNameElem) {
            treePartnerNameElem.textContent = name;
        }
    }

    function editTreeName(id, newName, rid) {
        fetch('php/partnership_smallscale.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ action: 'editTreeName', id, newName, registrantId: rid })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchTreeNames(rid);
            else alert('Edit failed: ' + data.error);
        })
        .catch(err => alert('Edit error: ' + err.message));
    }

    function softDeleteTreeName(id, rid) {
        fetch('php/partnership_smallscale.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({ action: 'softDeleteTreeName', id, registrantId: rid })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) fetchTreeNames(rid);
            else alert('Delete failed: ' + data.error);
        })
        .catch(err => alert('Delete error: ' + err.message));
    }

    function renderTreeNames(list, rid) {
        const container = document.getElementById('partnershipList');
        container.innerHTML = '';

        if (list.length > 0) {
            const treePartnerNameElem = document.getElementById('treePartnerName');
            if (treePartnerNameElem) {
                treePartnerNameElem.textContent = list[0].name;
            }
        }

        list.forEach(tree => {
            const item = document.createElement('div');
            item.className = 'tree-item flex justify-between items-center p-2 bg-white rounded mb-2 shadow';

            const name = document.createElement('span');
            name.textContent = tree.name;
            name.className = 'tree-name flex-grow';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'bg-blue-500 text-white px-2 py-1 rounded mr-2';
            editBtn.onclick = () => {
                const newName = prompt('Edit tree name:', tree.name);
                if (newName) editTreeName(tree.id, newName.trim(), rid);
            };

            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.className = 'bg-red-500 text-white px-2 py-1 rounded';
            delBtn.onclick = () => {
                if (confirm('Delete this tree name?')) softDeleteTreeName(tree.id, rid);
            };

            item.append(name, editBtn, delBtn);
            container.appendChild(item);
        });
    }

    // --- Logout ---
    document.getElementById('logoutLink').addEventListener('click', e => {
        e.preventDefault();
        document.getElementById('logoutConfirmPopup').style.display = 'flex';
    });

    document.getElementById('cancelLogoutBtn').onclick = () => {
        document.getElementById('logoutConfirmPopup').style.display = 'none';
    };

    document.getElementById('confirmLogoutBtn').onclick = () => {
        localStorage.removeItem('editRegistrant');
        fetch('php/logout.php', { method: 'POST' })
            .then(() => {
                window.location.href = 'login.html';
            })
            .catch(() => {
                window.location.href = 'login.html';
            });
    };

    // --- Certificate (Placeholder) ---
    document.getElementById('downloadCertificateLink').addEventListener('click', e => {
        e.preventDefault();
        alert('Certificate download would go here.');
    });
});
