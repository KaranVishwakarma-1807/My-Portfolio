/* Final bugfixes: anchor-based project cards & improved toast visibility */

// ----- Config ----- //
const GITHUB_USERNAME = 'your-github-username';
const EXPERIENCE_DATA = [
  {
    company: 'Tech Corp',
    title: 'Full-Stack Developer',
    startDate: 'May 2023',
    endDate: 'Present',
    description: 'Developing scalable web applications in React and Node.',
    techStack: ['React', 'Node.js', 'MongoDB', 'AWS'],
  },
  {
    company: 'Startup XYZ',
    title: 'Software Engineer Intern',
    startDate: 'Jun 2022',
    endDate: 'Aug 2022',
    description: 'Built features for the user dashboard and improved performance.',
    techStack: ['Vue', 'Firebase'],
  },
];

const FALLBACK_PROJECTS = [
  {
    name: 'Portfolio Website',
    description: 'My personal portfolio built with React and Tailwind CSS.',
    stargazers_count: 42,
    language: 'JavaScript',
    html_url: 'https://github.com/your-github-username/portfolio',
  },
  {
    name: 'API Server',
    description: 'Express.js REST API boilerplate with authentication.',
    stargazers_count: 30,
    language: 'TypeScript',
    html_url: 'https://github.com/your-github-username/api-server',
  },
  {
    name: 'UI Components',
    description: 'Reusable component library styled with Tailwind.',
    stargazers_count: 15,
    language: 'JavaScript',
    html_url: 'https://github.com/your-github-username/ui-components',
  },
];

function createEl(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.classList) el.className = options.classList;
  if (options.text) el.textContent = options.text;
  if (options.html) el.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([k, v]) => el.setAttribute(k, v));
  }
  return el;
}

function renderRepoCard(repo) {
  // Use anchor so that browser handles navigation reliably
  const anchor = createEl('a', {
    classList: 'card project-card reveal-hidden flex flex-col',
    attrs: { href: repo.html_url, target: '_blank', rel: 'noopener noreferrer' },
  });

  const body = createEl('div', { classList: 'card__body flex flex-col gap-8' });
  const name = createEl('h3', { text: repo.name });
  const desc = createEl('p', {
    text: repo.description || 'No description provided.',
    classList: 'project-meta',
  });

  const meta = createEl('div', { classList: 'flex gap-8 project-meta' });
  meta.append(
    createEl('span', { text: `⭐ ${repo.stargazers_count}` }),
    createEl('span', { text: repo.language || '—' })
  );

  body.append(name, desc, meta);
  anchor.appendChild(body);
  return anchor;
}

async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  const loader = document.getElementById('projects-loader');
  const errorEl = document.getElementById('projects-error');

  loader.classList.remove('hidden');
  errorEl.classList.add('hidden');
  let repos = [];

  try {
    const resp = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`);
    if (resp.ok) {
      const data = await resp.json();
      repos = data.filter((r) => !r.fork);
    } else {
      console.warn('GitHub API status not OK');
    }
  } catch (err) {
    console.warn('GitHub fetch failed', err);
  }
  if (repos.length === 0) repos = FALLBACK_PROJECTS;

  grid.innerHTML = '';
  repos.forEach((repo) => grid.appendChild(renderRepoCard(repo)));

  loader.classList.add('hidden');
  revealObserver.observeAll();
}

function loadExperience() {
  const timeline = document.getElementById('timeline');
  EXPERIENCE_DATA.forEach((item) => {
    const wrapper = createEl('div', {
      classList: 'timeline-item card reveal-hidden',
    });
    const body = createEl('div', { classList: 'card__body flex flex-col gap-8' });

    body.append(
      createEl('h4', { text: `${item.title} – ${item.company}` }),
      createEl('span', { text: `${item.startDate} – ${item.endDate}`, classList: 'timeline-date' }),
      createEl('p', { text: item.description }),
      createEl('p', { text: 'Tech: ' + item.techStack.join(', '), classList: 'project-meta' })
    );

    wrapper.appendChild(body);
    timeline.appendChild(wrapper);
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  const toast = document.getElementById('toast');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());
    console.log('Contact payload', payload);
    form.reset();

    // show toast
    toast.classList.remove('hidden');
    toast.classList.add('toast--visible');

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      toast.addEventListener(
        'transitionend',
        () => toast.classList.add('hidden'),
        { once: true }
      );
    }, 3000);
  });
}

const revealObserver = new (class {
  constructor() {
    this.observer = new IntersectionObserver(this.onEntry.bind(this), { threshold: 0.1 });
  }
  observeAll() {
    document.querySelectorAll('.reveal-hidden').forEach((el) => this.observer.observe(el));
  }
  onEntry(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        entry.target.classList.remove('reveal-hidden');
        this.observer.unobserve(entry.target);
      }
    });
  }
})();

function initNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadExperience();
  initContactForm();
  initNavigation();
  revealObserver.observeAll();
});
