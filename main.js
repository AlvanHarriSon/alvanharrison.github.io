"use strict";
const filters = document.querySelectorAll("[data-filter]");
const projects = [...document.querySelectorAll("[data-category]")];
for (const button of filters) {
  button.addEventListener("click", () => {
    const selected = button.dataset.filter;
    for (const other of filters) other.setAttribute("aria-pressed", String(other === button));
    let visible = 0;
    for (const project of projects) {
      project.hidden = selected !== "all" && project.dataset.category !== selected;
      if (!project.hidden) visible += 1;
    }
    document.getElementById("filter-status").textContent = `Showing ${visible} projects.`;
  });
}
