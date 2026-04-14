// Sistema de comentários com localStorage

(function () {
  'use strict';

  const STORAGE_KEY = 'drawing_comments';

  function loadComments() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveComments(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function getDrawingId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || 'default';
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function sanitize(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderComments(container, drawingId) {
    const data = loadComments();
    const comments = (data[drawingId] || []).slice().reverse();
    container.innerHTML = '';

    if (comments.length === 0) {
      container.innerHTML =
        '<p class="comments-empty">Nenhum comentário ainda. Seja o primeiro!</p>';
      return;
    }

    comments.forEach(function (c) {
      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML =
        '<div class="comment-header">' +
        '<strong class="comment-author">' + sanitize(c.author) + '</strong>' +
        '<span class="comment-date">' + formatDate(c.date) + '</span>' +
        '</div>' +
        '<p class="comment-text">' + sanitize(c.text) + '</p>';
      container.appendChild(item);
    });
  }

  function addComment(drawingId, author, text) {
    const data = loadComments();
    if (!data[drawingId]) {
      data[drawingId] = [];
    }
    data[drawingId].push({
      author: author.trim() || 'Anônimo',
      text: text.trim(),
      date: new Date().toISOString(),
    });
    saveComments(data);
  }

  function initComments() {
    const section = document.getElementById('comments-section');
    if (!section) return;

    const drawingId = getDrawingId();

    section.innerHTML =
      '<h3 class="comments-title">Comentários</h3>' +
      '<div id="comments-list"></div>' +
      '<form id="comment-form" class="comment-form">' +
      '<input id="comment-author" type="text" placeholder="Seu nome (opcional)" maxlength="60" class="comment-input" />' +
      '<textarea id="comment-text" placeholder="Escreva um comentário…" maxlength="500" rows="3" class="comment-textarea" required></textarea>' +
      '<button type="submit" class="comment-submit">Enviar comentário</button>' +
      '</form>';

    const list = document.getElementById('comments-list');
    renderComments(list, drawingId);

    document.getElementById('comment-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const author = document.getElementById('comment-author').value;
      const text = document.getElementById('comment-text').value;
      if (!text.trim()) return;

      addComment(drawingId, author, text);
      document.getElementById('comment-author').value = '';
      document.getElementById('comment-text').value = '';
      renderComments(list, drawingId);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComments);
  } else {
    initComments();
  }
}());
