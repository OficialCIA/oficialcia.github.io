// JavaScript for theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  // Save the user’s preference
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Check for saved user preference
if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
}