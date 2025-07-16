// script.js
document.addEventListener("DOMContentLoaded", () => {
  const dropdownToggle = document.querySelector(".dropdown-toggle");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (dropdownToggle && dropdownMenu) {
    dropdownToggle.addEventListener("click", () => {
      const expanded = dropdownToggle.getAttribute("aria-expanded") === "true";
      dropdownToggle.setAttribute("aria-expanded", !expanded);
      dropdownMenu.style.display = expanded ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!dropdownToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownToggle.setAttribute("aria-expanded", false);
        dropdownMenu.style.display = "none";
      }
    });
  }
});
