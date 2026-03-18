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

function getCountry() {
  const country = document.getElementById("countryInput").value.trim();
  const result = document.getElementById("result");

  if (country === "") {
    result.innerHTML = "<p>Please enter a country name.</p>";
    return;
  }

  result.innerHTML = "<p>Loading...</p>";

  fetch(`https://restcountries.com/v3.1/name/${country}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Country not found");
      }
      return response.json();
    })
    .then((data) => {
      const c = data[0];

      const capital = c.capital ? c.capital[0] : "Unknown";

      result.innerHTML = `
        <div class="country-card">
          <h2>${c.name.common}</h2>
          <img src="${c.flags.png}">
          <p><strong>Capital:</strong> ${capital}</p>
          <p><strong>Region:</strong> ${c.region}</p>
          <p><strong>Population:</strong> ${c.population.toLocaleString()}</p>

          <button onclick="saveCountry(
            '${c.name.common}',
            '${capital}',
            '${c.region}',
            '${c.population}',
            '${c.flags.png}'
          )">Save</button>
        </div>
      `;
    })
    .catch((error) => {
      result.innerHTML = "<p>Country not found or API error.</p>";
    });
}

function saveCountry(name, capital, region, population, flag) {
  let saved = JSON.parse(localStorage.getItem("savedCountries")) || [];

  // Prevent duplicates
  const exists = saved.some((c) => c.name === name);

  if (exists) {
    alert("Country already saved!");
    return;
  }

  const newCountry = {
    name,
    capital,
    region,
    population,
    flag,
  };

  saved.push(newCountry);

  localStorage.setItem("savedCountries", JSON.stringify(saved));

  alert("Saved successfully!");
}

document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("savedList");

  if (container) {
    const saved = JSON.parse(localStorage.getItem("savedCountries")) || [];

    if (saved.length === 0) {
      container.innerHTML = "<p>No saved items yet.</p>";
      return;
    }

    saved.forEach((c) => {
      container.innerHTML += `
        <div class="country-card">
          <h2>${c.name}</h2>
          <img src="${c.flag}">
          <p><strong>Capital:</strong> ${c.capital}</p>
          <p><strong>Region:</strong> ${c.region}</p>
          <p><strong>Population:</strong> ${Number(c.population).toLocaleString()}</p>

          <button onclick="deleteCountry('${c.name}')">Delete</button>
        </div>
      `;
    });
  }
});

function deleteCountry(name) {
  let saved = JSON.parse(localStorage.getItem("savedCountries")) || [];

  saved = saved.filter((c) => c.name !== name);

  localStorage.setItem("savedCountries", JSON.stringify(saved));

  location.reload();
}
