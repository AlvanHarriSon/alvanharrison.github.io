'use strict';

// Content remains in the document; JavaScript adds exploration and wayfinding.
const stageCopy = {
  input: ['Start with the observation', 'GONG H-alpha images provide the input. The diagram shows the image domain and processing stages, rather than a prediction.'],
  detect: ['Locate candidate filaments', 'YOLO11 proposes regions that may contain filaments. These regions guide the next stage instead of treating the full image as a single object.'],
  refine: ['Refine each region', 'The region-of-interest refiner uses image crops to estimate a more detailed filament mask within each proposed region.'],
  filter: ['Check mask quality', 'Four spatial quality heads score accepted masks. Their mean determines which instances enter the submission.'],
  export: ['Keep the output inspectable', 'Instance masks are encoded as compressed COCO RLE. The exporter checks the completed CSV, unique instance IDs and disjoint masks within each observation.']
};
const stageTabs = [...document.querySelectorAll('[data-stage]')];
const stagePanel = document.querySelector('#stage-panel');
const pipeline = document.querySelector('#solar-pipeline');
function selectStage(tab, moveFocus = false) {
  const key = tab.dataset.stage;
  stageTabs.forEach(button => {
    const selected = button === tab;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  pipeline.dataset.activeStage = key;
  stagePanel.setAttribute('aria-labelledby', tab.id);
  stagePanel.querySelector('h3').textContent = stageCopy[key][0];
  stagePanel.querySelector('p').textContent = stageCopy[key][1];
  if (moveFocus) tab.focus();
}
stageTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectStage(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % stageTabs.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + stageTabs.length) % stageTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = stageTabs.length - 1;
    if (next !== undefined) { event.preventDefault(); selectStage(stageTabs[next], true); }
  });
});
selectStage(stageTabs[0]);

const search = document.querySelector('#project-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const rows = [...document.querySelectorAll('[data-project]')];
const resultCount = document.querySelector('#project-count');
const emptyState = document.querySelector('#no-projects');
let activeFilter = 'all';
function filterProjects() {
  const query = search.value.trim().toLocaleLowerCase();
  let count = 0;
  rows.forEach(row => {
    const matchesArea = activeFilter === 'all' || row.dataset.category === activeFilter;
    const searchableText = `${row.textContent} ${row.dataset.project} ${row.dataset.category}`.toLocaleLowerCase();
    const matchesText = searchableText.includes(query);
    row.hidden = !(matchesArea && matchesText);
    if (!row.hidden) count++;
  });
  resultCount.textContent = count === rows.length ? `Showing all ${rows.length} projects.` : `Showing ${count} of ${rows.length} projects.`;
  emptyState.hidden = count !== 0;
  document.querySelector('#project-index').hidden = count === 0;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  filterProjects();
}));
search.addEventListener('input', filterProjects);
function resetProjects() {
  search.value = '';
  activeFilter = 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
  filterProjects();
}
document.querySelector('#reset-projects').addEventListener('click', resetProjects);
document.querySelector('#empty-reset').addEventListener('click', () => { resetProjects(); search.focus(); });

const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
function closeMenu(returnFocus = false) {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
  if (returnFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const opening = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(opening));
  nav.classList.toggle('is-open', opening);
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (menu.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width: 621px)').addEventListener('change', () => closeMenu());

const sectionLinks = [...document.querySelectorAll('[data-nav]')];
const sections = [...document.querySelectorAll('main > section[id]')];
let scrollPending = false;
function updateNavigation() {
  const marker = window.scrollY + Math.min(window.innerHeight * 0.3, 180);
  let current = sections[0].id;
  sections.forEach(section => { if (section.offsetTop <= marker) current = section.id; });
  sectionLinks.forEach(link => {
    if (link.dataset.nav === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollPending = false;
}
window.addEventListener('scroll', () => {
  if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateNavigation); }
}, {passive: true});
window.addEventListener('resize', updateNavigation);
updateNavigation();
