
async function loadPreferences() {
  const res = await fetch('/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  const ul = document.getElementById('preferences-list');
  ul.innerHTML = '';
  prefs.forEach(pref => {
    const li = document.createElement('li');
    li.textContent = `${pref.topic} (${pref.resource_type}) `;

  
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Șterge';
    delBtn.className = 'form-button';
    delBtn.style.marginLeft = '1em';
    delBtn.onclick = async () => {
      await fetch(`/user/preferences?id=${pref.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      loadPreferences();
    };

    li.appendChild(delBtn);
    ul.appendChild(li);
  });
}

document.getElementById('deletePreferenceBtn').onclick = async function() {
  const topic = document.querySelector('input[name="topic"]').value;
  const resourceType = document.querySelector('select[name="resourceType"]').value;
  
  const res = await fetch('/user/preferences', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const prefs = await res.json();
  
  const pref = prefs.find(p => p.topic === topic && p.resource_type === resourceType);
  if (pref) {
    await fetch(`/user/preferences?id=${pref.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });
    loadPreferences();
  } else {
    alert('Nu există această preferință!');
  }
};

document.getElementById('preferencesForm').onsubmit = async function(e) {
  e.preventDefault();
  const topic = this.topic.value;
  const resourceType = this.resourceType.value;

  await fetch('/user/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ topic, resource_type: resourceType })
  });

  this.reset();
  loadPreferences();
};

async function loadProfile() {
  const res = await fetch('/user/profile', {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  if (!res.ok) {
    window.location.href = 'login.html';
    return;
  }
  const user = await res.json();
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-role').textContent = user.role === 'admin' ? 'Administrator' : 'Utilizator';
}

// schimb passw
document.getElementById('toggle-password-change').onclick = function() {
  const section = document.getElementById('password-change-section');
  section.style.display = section.style.display === 'none' ? 'block' : 'none';
};

loadProfile();

