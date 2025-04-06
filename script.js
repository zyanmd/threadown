document.getElementById('downloadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const input = document.getElementById('urlInput');
  const resultDiv = document.getElementById('result');
  const url = input.value.trim();

  if (!url) return;

  resultDiv.innerHTML = '<p>Memuat data...</p>';

  try {
    const apiURL = `https://api.siputzx.my.id/api/d/lahelu?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiURL);
    const data = await response.json();

    if (data && data.status && data.result) {
      const r = data.result;
      const hashtags = r.hashtags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');

      let mediaPreview = '';
      let downloadButton = '';

      if (r.mediaType === 0) {
        // Jika gambar
        mediaPreview = `<img src="${r.media}" alt="Preview" class="media-preview">`;
        downloadButton = `<a href="${r.media}" download><button class="download-btn">Download Gambar</button></a>`;
      } else {
        // Jika video atau lainnya
        mediaPreview = `
          <video controls width="100%" poster="${r.mediaThumbnail || ''}">
            <source src="${r.media}" type="video/mp4">
            Browser tidak mendukung pemutar video.
          </video>`;
        downloadButton = `<a href="${r.media}" download><button class="download-btn">Download Video</button></a>`;
      }

      resultDiv.innerHTML = `
        <div class="video-box">
          <h2>${r.title}</h2>
          ${mediaPreview}
          ${downloadButton}
        </div>

        <div class="info-box">
                  <p class="description">${r.description?.replace(/\n/g, '<br>')}</p>
          <p class="votes">Upvotes: ${r.totalUpvotes} | Downvotes: ${r.totalDownvotes}</p>
          <div class="tags">${hashtags}</div>
        </div>
          <img src="${r.userAvatar}" alt="Avatar" class="avatar">
          <p><strong>${r.userUsername}</strong> | <em>Topik: ${r.topicTitle || '-'}</em></p>
          ${r.topicMedia ? `<img src="${r.topicMedia}" alt="Topic Banner" class="topic-img">` : ''}
      `;
    } else {
      resultDiv.innerHTML = '<p>Data tidak ditemukan atau format tidak dikenali.</p>';
    }
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<p>Gagal memuat. Pastikan URL benar dan server tersedia.</p>';
  }
});
