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
