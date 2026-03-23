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

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  //Login Validation Stuff
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

  //Signup Validation Stuff
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

  function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
});

function deleteRow(button) {
  const row = button.parentNode.parentNode;
  row.remove();
}

const addUserForm = document.getElementById("addUserForm");

if (addUserForm) {
  addUserForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("newName").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const role = document.getElementById("newRole").value;

    // To get existing users
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // Add new user
    users.push({
      name: name,
      email: email,
      role: role,
    });

    // Save back to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    alert("User Added: " + name);

    addUserForm.reset();
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const table = document.getElementById("userTable");

  if (table) {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    users.forEach((user) => {
      const row = table.insertRow();

      row.insertCell(0).textContent = user.name;
      row.insertCell(1).textContent = user.email;
      row.insertCell(2).textContent = user.role;

      const actionCell = row.insertCell(3);
      actionCell.innerHTML =
        '<button onclick="deleteRow(this)">Delete</button>';
    });
  }
});

function loadMonsters() {
  const list = document.getElementById("monsterList");

  list.classList.remove("detail-view");
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
          .then((monster) => {
            renderMonsterCard(monster);
          });
      });
    });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function getMonsterImage(type) {
  const images = {
    undead: "assets/undead.jpg",
    aberration: "assets/aberration.jpg",
  };

  return images[type] || "assets/default.jpg";
}

function getThreatLevel(cr) {
  if (cr <= 2) return "Manageable";
  if (cr <= 5) return "Dangerous";
  if (cr <= 10) return "Severe";
  return "Apocalyptic";
}

function renderMonsterCard(m) {
  const list = document.getElementById("monsterList");

  const card = document.createElement("div");
  card.className = "country-card";

  card.innerHTML = `
    <h3>${m.name}</h3>
    <button onclick="getMonster('${m.index}')">View</button>
  `;

  list.appendChild(card);
}

function getMonster(index) {
  const list = document.getElementById("monsterList");

  list.classList.add("detail-view");
  list.innerHTML = "Loading details...";

  fetch(`https://www.dnd5eapi.co/api/monsters/${index}`)
    .then((res) => res.json())
    .then((m) => {
      list.innerHTML = `
        <div class="country-Card.detail">
          <h2>${m.name}</h2>

          <img src="${getMonsterImage(m.type)}" class="monster-img">

          <p><strong>Species:</strong> ${m.type}</p>
          <p><strong>HP:</strong> ${m.hit_points}</p>

          <p><strong>Threat:</strong> ${m.challenge_rating}
          (${getThreatLevel(m.challenge_rating)})</p>

          <p><strong>Lore:</strong><br>${generateLore(m)}</p>

          <button onclick="saveMonster('${m.name}', '${m.type}', '${m.hit_points}')">
            Save Creature
          </button>

          <br><br>

          <button onclick="loadMonsters()">
            Back
          </button>
        </div>
      `;

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
}

function saveMonster(name, type, hp) {
  let saved = JSON.parse(localStorage.getItem("monsters")) || [];

  const exists = saved.some((m) => m.name === name);

  if (exists) {
    alert("Already saved!");
    return;
  }

  saved.push({ name, type, hp });

  localStorage.setItem("monsters", JSON.stringify(saved));

  alert("Creature saved!");
}

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("savedList");

  if (container) {
    const saved = JSON.parse(localStorage.getItem("monsters")) || [];

    if (saved.length === 0) {
      container.innerHTML = "No saved creatures yet.";
      return;
    }

    saved.forEach((m) => {
      container.innerHTML += `
        <div class="country-card">
          <h3>${m.name}</h3>
          <p>Type: ${m.type}</p>
          <p>HP: ${m.hp}</p>

          <button onclick="deleteMonster('${m.name}')">
            Delete
          </button>
        </div>
      `;
    });
  }
});

function deleteMonster(name) {
  let saved = JSON.parse(localStorage.getItem("monsters")) || [];

  saved = saved.filter((m) => m.name !== name);

  localStorage.setItem("monsters", JSON.stringify(saved));

  location.reload();
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

  return (
    loreMap[m.index] ||
    loreMap[m.name.toLowerCase()] ||
    `${m.name} is an unknown entity recorded in forbidden archives. Proceed with caution.`
  );
}
