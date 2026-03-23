// ==================== GLOBALS ====================
const allowedKeywords = [
  "zombie",
  "skeleton",
  "wraith",
  "lich",
  "cultist",
  "gibbering-mouther",
  "aboleth",
];
const excludedKeywords = ["minotaur skeleton", "warhorse skeleton"];

// ==================== DOM READY ====================
document.addEventListener("DOMContentLoaded", function () {
  // ----- LOGIN -----
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (username.length < 3) {
        alert("Username must be at least 3 characters.");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }

      if (username === "admin") {
        localStorage.setItem("userRole", "admin");
        window.location.href = "admin.html";
      } else {
        localStorage.setItem("userRole", "user");
        window.location.href = "profile.html";
      }
    });
  }

  // ----- SIGNUP -----
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const confirm = document.getElementById("signupConfirm").value.trim();

      if (!validateEmail(email)) {
        alert("Please enter a valid email.");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirm) {
        alert("Passwords do not match.");
        return;
      }

      alert("Account created successfully!");
      window.location.href = "login.html";
    });
  }

  // ----- ADD USER -----
  const addUserForm = document.getElementById("addUserForm");
  if (addUserForm) {
    addUserForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const name = document.getElementById("newName").value.trim();
      const email = document.getElementById("newEmail").value.trim();
      const role = document.getElementById("newRole").value.trim();

      if (!name || !email || !role) {
        alert("Please fill all fields.");
        return;
      }

      let users = JSON.parse(localStorage.getItem("users")) || [];
      const newId = Date.now(); // simple unique ID
      users.push({ id: newId, name, email, role });
      localStorage.setItem("users", JSON.stringify(users));

      alert("User Added: " + name);
      addUserForm.reset();

      // optional: redirect to manage users page
      if (confirm("User added. Go to Manage Users?")) {
        window.location.href = "manage_users.html";
      }
    });
  }

  // ----- MANAGE USERS TABLE -----
  const userTable = document.getElementById("userTable");
  if (userTable) {
    loadUserTable();
  }

  // ----- SAVED CREATURES -----
  const savedContainer = document.getElementById("savedList");
  if (savedContainer) {
    displaySavedCreatures();
  }
});

// ==================== HELPERS ====================
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ==================== USER MANAGEMENT ====================
function loadUserTable() {
  const table = document.getElementById("userTable");
  if (!table) return;

  // Clear all rows except the header
  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];
  users.forEach((user) => {
    const row = table.insertRow();
    row.insertCell(0).textContent = user.id;
    row.insertCell(1).textContent = user.name;
    row.insertCell(2).textContent = user.email;

    const actionCell = row.insertCell(3);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteUser(user.id);
    actionCell.appendChild(deleteBtn);
  });
}

function deleteUser(userId) {
  let users = JSON.parse(localStorage.getItem("users")) || [];
  users = users.filter((u) => u.id !== userId);
  localStorage.setItem("users", JSON.stringify(users));
  loadUserTable(); // re-render table
}

// Make deleteUser available globally for inline onclick (if needed)
window.deleteUser = deleteUser;

// Keep legacy deleteRow for any inline usage (but we'll override)
window.deleteRow = function (btn) {
  const row = btn.closest("tr");
  if (row && row.parentNode) {
    row.remove();
  }
};

// ==================== MONSTER FUNCTIONS ====================
function loadMonsters() {
  const list = document.getElementById("monsterList");
  list.className = ""; // remove detail-view
  list.innerHTML = "Loading creatures...";

  fetch("https://www.dnd5eapi.co/api/monsters")
    .then((res) => res.json())
    .then((data) => {
      list.innerHTML = "";
      const filtered = data.results.filter((m) => {
        const name = m.name.toLowerCase();
        const isAllowed = allowedKeywords.some((k) =>
          name.includes(k.toLowerCase()),
        );
        const isExcluded = excludedKeywords.some((k) =>
          name.includes(k.toLowerCase()),
        );
        return isAllowed && !isExcluded;
      });

      filtered.forEach((m) => {
        fetch(`https://www.dnd5eapi.co/api/monsters/${m.index}`)
          .then((res) => res.json())
          .then((monster) => renderMonsterCard(monster));
      });
    })
    .catch((err) => {
      list.innerHTML = "Failed to load creatures.";
      console.error(err);
    });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderMonsterCard(monster) {
  const list = document.getElementById("monsterList");
  const card = document.createElement("div");
  card.className = "monster-card";
  card.innerHTML = `
    <h3>${monster.name}</h3>
    <button onclick="getMonster('${monster.index}')">View</button>
  `;
  list.appendChild(card);
}

function getMonster(index) {
  const list = document.getElementById("monsterList");
  list.className = "detail-view";
  list.innerHTML = "Loading details...";

  fetch(`https://www.dnd5eapi.co/api/monsters/${index}`)
    .then((res) => res.json())
    .then((m) => {
      list.innerHTML = `
        <div class="monster-detail">
          <h2>${m.name}</h2>
          <img src="${getMonsterImage(m.type)}" alt="${m.type}" class="monster-img">
          <p>no art/images yet</p>
          <p><strong>Species:</strong> ${m.type}</p>
          <p><strong>HP:</strong> ${m.hit_points}</p>
          <p><strong>Threat:</strong> ${getThreatLevel(m.challenge_rating)}</p>
          <p><strong>Lore:</strong><br>${generateLore(m)}</p>
          <button onclick="saveMonster('${m.name}', '${m.type}', ${m.hit_points})">Save Creature</button>
          <button onclick="loadMonsters()">Back</button>
        </div>
      `;
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function getMonsterImage(type) {
  const images = {
    undead: "asset/undead.jpg",
    aberration: "asset/aberration.jpg",
  };
  return images[type] || "asset/default.jpg";
}

function getThreatLevel(cr) {
  if (cr <= 2) return "Manageable";
  if (cr <= 5) return "Dangerous";
  if (cr <= 10) return "Severe";
  return "Apocalyptic";
}

function generateLore(m) {
  const loreMap = {
    zombie:
      "A reanimated corpse driven by unknown dark force. They are often found in graveyards and battlefields.",
    skeleton:
      "Bones bound by cursed energy, animated to serve as guardians or soldiers.",
    wraith: "A manifestation of grief and unresolved death.",
    lich: "A forbidden sorcerer who achieved immortality through dark rituals and phylacteries.",
    cultist:
      "Individuals who follow unknown entities, often seen gathering in secret rituals.",
    "gibbering-mouther":
      "A shapeless horror that speaks in countless voices at once, consuming sanity itself.",
  };
  const key = m.name.toLowerCase();
  return (
    loreMap[key] ||
    `${m.name} is an unknown entity recorded in forbidden archives. Proceed with caution.`
  );
}

function saveMonster(name, type, hp) {
  let saved = JSON.parse(localStorage.getItem("monsters")) || [];
  if (saved.some((m) => m.name === name)) {
    alert("Already saved!");
    return;
  }
  saved.push({ name, type, hp });
  localStorage.setItem("monsters", JSON.stringify(saved));
  alert("Creature saved!");
}

function searchMonster() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const list = document.getElementById("monsterList");
  if (!query) return;

  list.innerHTML = "Searching...";
  fetch("https://www.dnd5eapi.co/api/monsters")
    .then((res) => res.json())
    .then((data) => {
      const match = data.results.find((m) =>
        m.name.toLowerCase().includes(query),
      );
      if (!match) {
        list.innerHTML = "No creature found.";
        return;
      }
      getMonster(match.index);
    });
}

// ==================== SAVED CREATURES PAGE ====================
function displaySavedCreatures() {
  const container = document.getElementById("savedList");
  const saved = JSON.parse(localStorage.getItem("monsters")) || [];

  if (saved.length === 0) {
    container.innerHTML = "<p>No saved creatures yet.</p>";
    return;
  }

  container.innerHTML = "";
  saved.forEach((m) => {
    const card = document.createElement("div");
    card.className = "monster-card";
    card.innerHTML = `
      <h3>${m.name}</h3>
      <p>Type: ${m.type}</p>
      <p>HP: ${m.hp}</p>
      <button onclick="deleteMonster('${m.name}')">Delete</button>
    `;
    container.appendChild(card);
  });
}

function deleteMonster(name) {
  let saved = JSON.parse(localStorage.getItem("monsters")) || [];
  saved = saved.filter((m) => m.name !== name);
  localStorage.setItem("monsters", JSON.stringify(saved));
  displaySavedCreatures(); // refresh list
}

// Make functions available globally for inline onclick
window.loadMonsters = loadMonsters;
window.getMonster = getMonster;
window.saveMonster = saveMonster;
window.searchMonster = searchMonster;
window.deleteMonster = deleteMonster;
