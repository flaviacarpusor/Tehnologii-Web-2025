document.addEventListener('DOMContentLoaded', async () => {
  // --- protectie acces admin ---
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  try {
    const res = await fetch('http://localhost:3000/user/profile', {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) {
      window.location.href = 'login.html';
      return;
    }
    const user = await res.json();
    if (user.role !== 'admin') {
      alert('Acces interzis! Doar adminii pot intra aici.');
      window.location.href = 'login.html';
      return;
    }
  } catch (e) {
    window.location.href = 'login.html';
    return;
  }

  // --- logout ---
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  }

  // --- taburi ---
  const tabResurse = document.getElementById('tab-resurse');
  const tabUtilizatori = document.getElementById('tab-utilizatori');
  const sectionResurse = document.getElementById('section-resurse');
  const sectionUtilizatori = document.getElementById('section-utilizatori');

  tabResurse.addEventListener('change', function() {
    sectionResurse.style.display = 'block';
    sectionUtilizatori.style.display = 'none';
    // daca dropdownul e pe "listeaza toate resursele", listeaza automat
    if (resourceActions.value === 'list') {
      listAllResources();
    }
  });
  tabUtilizatori.addEventListener('change', function() {
    sectionResurse.style.display = 'none';
    sectionUtilizatori.style.display = 'block';
  });

  // --- gestionare resurse ---
  const resourceActions = document.getElementById('resource-actions');
  const addResourceForm = document.getElementById('addResourceForm');
  const resourceList = document.getElementById('resource-list');

  // la incarcare, seteaza vizibilitatea corecta pentru formular
  if (addResourceForm) {
    addResourceForm.style.display = resourceActions.value === 'add' ? 'block' : 'none';
  }

  // afiseaza formularul doar daca e selectat "adauga manual resurse"
  resourceActions.addEventListener('change', function() {
    if (addResourceForm) {
      addResourceForm.style.display = this.value === 'add' ? 'block' : 'none';
    }
    if (this.value === 'list') {
      listAllResources();
      resourceList.style.display = 'block';
    } else if (this.value === 'delete') {
      showDeleteResources();
      resourceList.style.display = 'block';
    } else {
      resourceList.style.display = 'none';
    }
  });

  // la incarcare, daca dropdownul e pe "listeaza toate resursele", listeaza automat
  if (resourceActions && resourceActions.value === 'list') {
    resourceList.style.display = 'block';
    listAllResources();
  } else {
    resourceList.style.display = 'none';
  }

  // --- functie listare resurse ---
  async function listAllResources() {
    const res = await fetch('http://localhost:3000/admin/resources', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    resourceList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      resourceList.innerHTML = '<p>Nu exista resurse.</p>';
      return;
    }

    // creeaza un tabel simplu
    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Titlu</th>
        <th>Tip</th>
        <th>Topic</th>
        <th>Vizibilitate</th>
        <th>Data</th>
      </tr>
    `;
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${item.topic}</td>
        <td>${item.visibility}</td>
        <td>${item.import_date ? new Date(item.import_date).toLocaleString() : ''}</td>
      `;
      table.appendChild(tr);
    });
    resourceList.appendChild(table);
  }

  // --- gestionare utilizatori ---
  const userActions = document.getElementById('user-actions');
  const userList = document.getElementById('user-list');
  userActions.addEventListener('change', function() {
    if (this.value === 'list') {
      userList.style.display = 'block';
      listAllUsers();
    } else if (this.value === 'delete') {
      userList.style.display = 'block';
      showDeleteUsers();
    } else if (this.value === 'role') {
      userList.style.display = 'block';
      showRoleEditUsers();
    } else {
      userList.style.display = 'none';
    }
  });
  // la incarcare, seteaza vizibilitatea corecta
  userList.style.display = (userActions.value === 'list' || userActions.value === 'delete') ? 'block' : 'none';
  if (userActions.value === 'list') {
    listAllUsers();
  } else if (userActions.value === 'delete') {
    showDeleteUsers();
  } else if (userActions.value === 'role') {
    showRoleEditUsers();
  }

  if (addResourceForm) {
    addResourceForm.onsubmit = async function(e) {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const url = document.getElementById('url').value;
      const type = document.getElementById('type').value;
      const description = document.getElementById('description').value;
      const topic = document.getElementById('topic').value;
      const visibility = document.getElementById('visibility').value;
      const keywords = document.getElementById('keywords').value;
      const msg = document.getElementById('admin-message');

      msg.textContent = '';
      try {
        const res = await fetch('http://localhost:3000/admin/resources', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ title, url, type, description, topic, visibility, keywords })
        });
        const data = await res.json();
        if (res.ok) {
          msg.textContent = 'Resursa a fost adaugata!';
          msg.style.color = 'green';
          addResourceForm.reset();
          listAllResources(); // reincarca lista de resurse dupa adaugare
        } else {
          msg.textContent = data.error || 'Eroare la adaugare!';
          msg.style.color = 'red';
        }
      } catch (err) {
        msg.textContent = 'Eroare la conectarea cu serverul!';
        msg.style.color = 'red';
      }
    };
  }

  async function showDeleteResources() {
    const res = await fetch('http://localhost:3000/admin/resources', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    resourceList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      resourceList.innerHTML = '<p>Nu exista resurse.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Titlu</th>
        <th>Tip</th>
        <th>Topic</th>
        <th>Vizibilitate</th>
        <th>Data</th>
        <th>Actiuni</th>
      </tr>
    `;
    data.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>${item.topic}</td>
        <td>${item.visibility}</td>
        <td>${item.import_date ? new Date(item.import_date).toLocaleString() : ''}</td>
        <td><button class="delete-btn" data-id="${item.id}">Sterge</button></td>
      `;
      table.appendChild(tr);
    });
    resourceList.appendChild(table);

    // adauga event listener pentru butoanele de stergere
    resourceList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Sigur vrei sa stergi aceasta resursa?')) {
          await fetch(`http://localhost:3000/admin/resources?id=${btn.dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          showDeleteResources(); // reincarca lista dupa stergere
        }
      });
    });
  }

  document.getElementById('export-json').onclick = async function() {
    const res = await fetch('http://localhost:3000/admin/export?format=json', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources-export.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  document.getElementById('export-csv').onclick = async function() {
    const res = await fetch('http://localhost:3000/admin/export?format=csv', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resources-export.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  document.getElementById('import-file').addEventListener('change', async function() {
    const file = this.files[0];
    if (!file) return;
    const formMsg = document.getElementById('import-export-message');
    formMsg.textContent = '';
    const reader = new FileReader();
    reader.onload = async function(e) {
      let content = e.target.result;
      let isCSV = file.name.endsWith('.csv');
      let url = 'http://localhost:3000/admin/import';
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': isCSV ? 'text/csv' : 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: content
        });
        const data = await res.json();
        if (res.ok) {
          formMsg.textContent = 'Import realizat cu succes!';
          formMsg.style.color = 'green';
          listAllResources();
        } else {
          formMsg.textContent = data.error || 'Eroare la import!';
          formMsg.style.color = 'red';
        }
      } catch (err) {
        formMsg.textContent = 'Eroare la conectarea cu serverul!';
        formMsg.style.color = 'red';
      }
    };
    reader.readAsText(file);
  });

  async function listAllUsers() {
    const res = await fetch('http://localhost:3000/admin/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    userList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      userList.innerHTML = '<p>Nu exista utilizatori.</p>';
      return;
    }

    // Verifică dacă dropdown-ul e pe "list"
    const showActions = userActions.value !== 'list';

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Rol</th>
        <th>Data creare</th>
        ${showActions ? '<th>Actiuni</th>' : ''}
      </tr>
    `;
    data.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
        ${showActions ? `<td><button class="delete-user-btn" data-id="${user.id}">Sterge</button></td>` : ''}
      `;
      table.appendChild(tr);
    });
    userList.appendChild(table);

    // Adaugă event listener doar dacă e cu acțiuni
    if (showActions) {
      userList.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async function() {
          if (confirm('Sigur vrei sa stergi acest utilizator?')) {
            await fetch(`http://localhost:3000/admin/users?id=${btn.dataset.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
            });
            listAllUsers(); // reincarca lista dupa stergere
          }
        });
      });
    }
  }

  // Functie noua pentru afisare doar cu stergere
  async function showDeleteUsers() {
    const res = await fetch('http://localhost:3000/admin/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    userList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      userList.innerHTML = '<p>Nu exista utilizatori.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Rol</th>
        <th>Data creare</th>
        <th>Actiuni</th>
      </tr>
    `;
    data.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>${user.created_at ? new Date(user.created_at).toLocaleString() : ''}</td>
        <td><button class="delete-user-btn" data-id="${user.id}">Sterge</button></td>
      `;
      table.appendChild(tr);
    });
    userList.appendChild(table);

    userList.querySelectorAll('.delete-user-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        if (confirm('Sigur vrei sa stergi acest utilizator?')) {
          await fetch(`http://localhost:3000/admin/users?id=${btn.dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
          });
          showDeleteUsers(); // reincarca lista dupa stergere
        }
      });
    });
  }

  async function showRoleEditUsers() {
    const res = await fetch('http://localhost:3000/admin/users', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    const data = await res.json();
    userList.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      userList.innerHTML = '<p>Nu exista utilizatori.</p>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <tr>
        <th>Username</th>
        <th>Email</th>
        <th>Rol curent</th>
        <th>Rol nou</th>
        <th>Actiune</th>
      </tr>
    `;
    data.forEach(user => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.role}</td>
        <td>
          <select class="role-select">
            <option value="user" ${user.role === 'user' ? 'selected' : ''}>user</option>
            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>admin</option>
          </select>
        </td>
        <td><button class="save-role-btn" data-id="${user.id}">Salvează</button></td>
      `;
      table.appendChild(tr);
    });
    userList.appendChild(table);

    userList.querySelectorAll('.save-role-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const userId = btn.dataset.id;
        const newRole = btn.closest('tr').querySelector('.role-select').value;
        const res = await fetch(`http://localhost:3000/admin/users/role`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ id: userId, role: newRole })
        });
        if (res.ok) {
          btn.textContent = 'Salvat!';
          btn.style.background = 'green';
          setTimeout(() => { btn.textContent = 'Salvează'; btn.style.background = ''; }, 1500);
        } else {
          btn.textContent = 'Eroare!';
          btn.style.background = 'red';
          setTimeout(() => { btn.textContent = 'Salvează'; btn.style.background = ''; }, 1500);
        }
      });
    });
  }
});


