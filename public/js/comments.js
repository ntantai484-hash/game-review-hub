document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.js-edit-comment').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = btn.dataset.id;
      const form = document.getElementById(`edit-form-${id}`);
      if (form) form.classList.remove('d-none');
      btn.style.display = 'none';
    });
  });

  document.querySelectorAll('.js-cancel-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = btn.dataset.id;
      const form = document.getElementById(`edit-form-${id}`);
      const editBtn = document.querySelector(`.js-edit-comment[data-id='${id}']`);
      if (form) form.classList.add('d-none');
      if (editBtn) editBtn.style.display = '';
    });
  });
  // Like / Dislike handlers
  async function postJSON(url) {
    const res = await fetch(url, { method: 'POST', headers: { 'Accept': 'application/json' } });
    return res.json();
  }

  document.querySelectorAll('.js-like-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = btn.dataset.id;
      try {
        const data = await postJSON(`/comments/${id}/like`);
        btn.querySelector('.like-count').textContent = data.likes;
        const dislikeBtn = document.querySelector(`.js-dislike-btn[data-id='${id}']`);
        if (dislikeBtn) dislikeBtn.querySelector('.dislike-count').textContent = data.dislikes;
      } catch (err) { console.error(err); }
    });
  });

  document.querySelectorAll('.js-dislike-btn').forEach(btn => {
    btn.addEventListener('click', async e => {
      const id = btn.dataset.id;
      try {
        const data = await postJSON(`/comments/${id}/dislike`);
        btn.querySelector('.dislike-count').textContent = data.dislikes;
        const likeBtn = document.querySelector(`.js-like-btn[data-id='${id}']`);
        if (likeBtn) likeBtn.querySelector('.like-count').textContent = data.likes;
      } catch (err) { console.error(err); }
    });
  });
});
