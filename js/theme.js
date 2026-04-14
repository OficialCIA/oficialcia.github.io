// JavaScript for theme toggle
(function () {
  'use strict';

  var themeToggle = document.getElementById('theme-toggle');

  function applyTheme(dark) {
    if (dark) {
      document.body.classList.add('dark-mode');
      if (themeToggle) themeToggle.textContent = '☀️';
    } else {
      document.body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.textContent = '🌙';
    }
  }

  // Apply saved preference immediately (before paint to avoid flash)
  applyTheme(localStorage.getItem('theme') === 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var isDark = document.body.classList.contains('dark-mode');
      applyTheme(!isDark);
      localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    });
  }
}());
