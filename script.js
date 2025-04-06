document.getElementById("downloadBtn").addEventListener("click", async () => {
  const urlInput = document.getElementById("urlInput").value.trim();
  const videoContainer = document.getElementById("videoContainer");
  videoContainer.innerHTML = "Loading...";

  if (!urlInput) {
    videoContainer.innerHTML = "Silakan masukkan URL terlebih dahulu.";
    return;
  }

  try {
    const response = await fetch(`https://thyo-api.biz.id/api/run/download/threadsdl?url=${encodeURIComponent(urlInput)}`);
    const data = await response.json();

    if (data?.status && Array.isArray(data.text?.media) && data.text.media.length > 0) {
      const { postInfo, media } = data.text;

      // Tambahkan CSS untuk tombol download
      const style = document.createElement("style");
      style.textContent = `
        .download-btn {
          margin: 10px auto;
          padding: 8px 15px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: block;
          transition: 0.3s;
        }
        .download-btn:hover {
          background: #1976D2;
        }
      `;
      document.head.appendChild(style);

      let mediaHtml = `
        <div style="margin-bottom: 10px;">
          <img src="${postInfo.avatarUrl}" alt="avatar" style="width: 50px; height: 50px; border-radius: 50%;">
          <strong>@${postInfo.username}</strong>
        </div>
        <p>${postInfo.mediaTitle || ''}</p>
      `;

      // Handle Gallery type
      if (postInfo.type === "Gallery") {
        const sliderId = "gallerySlider";
        mediaHtml += `
          <div id="${sliderId}" class="slider" style="position: relative; overflow: hidden; max-width: 100%; margin-bottom: 20px;">
            <div class="slides" style="white-space: nowrap; transition: transform 0.5s;">
              ${media.map((item, index) => `
                <div style="display: inline-block; width: 100%; text-align: center;">
                  <img src="${item.url}" alt="image" style="max-width: 95%; border-radius: 10px; margin: 10px;">
                  <button class="download-btn" data-url="${item.url}" data-filename="image-${index + 1}.jpg">
                    Download Gambar ${index + 1}
                  </button>
                </div>
              `).join("")}
            </div>
            <button class="prev" data-slider="${sliderId}" style="position: absolute; top: 50%; left: 10px;">&#10094;</button>
            <button class="next" data-slider="${sliderId}" style="position: absolute; top: 50%; right: 10px;">&#10095;</button>
          </div>
        `;
      } else {
        // Handle other media types
        media.forEach((item, index) => {
          if (item.type === "Video" && item.videoUrl) {
            mediaHtml += `
              <div style="margin-bottom: 20px; text-align: center;">
                <video controls poster="${item.thumbnailUrl || ''}" style="max-width: 100%;">
                  <source src="${item.videoUrl}" type="video/mp4" />
                </video>
                <button class="download-btn" data-url="${item.videoUrl}" data-filename="video-${index + 1}.mp4">
                  Download Video ${index + 1}
                </button>
              </div>
            `;
          } else if (item.type === "Photo") {
            if (Array.isArray(item.mediaGroup)) {
              const sliderId = `photoSlider${index}`;
              mediaHtml += `
                <div id="${sliderId}" class="slider" style="position: relative; overflow: hidden; max-width: 100%; margin-bottom: 20px;">
                  <div class="slides" style="white-space: nowrap; transition: transform 0.5s;">
                    ${item.mediaGroup.map((photo, subIndex) => `
                      <div style="display: inline-block; width: 100%; text-align: center;">
                        <img src="${photo.url}" alt="image" style="max-width: 95%; border-radius: 10px; margin: 10px;">
                        <button class="download-btn" 
                          data-url="${photo.url}" 
                          data-filename="image-${index + 1}-${subIndex + 1}.jpg">
                          Download Gambar ${index + 1}-${subIndex + 1}
                        </button>
                      </div>
                    `).join("")}
                  </div>
                  <button class="prev" data-slider="${sliderId}" style="position: absolute; top: 50%; left: 10px;">&#10094;</button>
                  <button class="next" data-slider="${sliderId}" style="position: absolute; top: 50%; right: 10px;">&#10095;</button>
                </div>
              `;
            } else if (item.url) {
              mediaHtml += `
                <div style="margin-bottom: 20px; text-align: center;">
                  <img src="${item.url}" alt="image" style="max-width: 100%; border-radius: 10px;">
                  <button class="download-btn" data-url="${item.url}" data-filename="image-${index + 1}.jpg">
                    Download Gambar ${index + 1}
                  </button>
                </div>
              `;
            }
          }
        });
      }

      videoContainer.innerHTML = mediaHtml;

      // Fungsi download
      function downloadFile(url, filename) {
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      // Handle semua tombol download
      document.querySelectorAll(".download-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const url = e.target.dataset.url;
          const filename = e.target.dataset.filename;
          downloadFile(url, filename);
        });
      });

      // Fungsi slider
      document.querySelectorAll(".slider").forEach(slider => {
        const slides = slider.querySelector(".slides");
        const totalSlides = slides.children.length;
        let currentIndex = 0;

        const showSlide = () => {
          slides.style.transform = `translateX(-${currentIndex * 100}%)`;
        };

        slider.querySelector(".prev").addEventListener("click", () => {
          currentIndex = Math.max(currentIndex - 1, 0);
          showSlide();
        });

        slider.querySelector(".next").addEventListener("click", () => {
          currentIndex = Math.min(currentIndex + 1, totalSlides - 1);
          showSlide();
        });

        showSlide();
      });

    } else {
      videoContainer.innerHTML = "Tidak ada media ditemukan atau URL tidak valid.";
    }

  } catch (error) {
    console.error("Fetch error:", error);
    videoContainer.innerHTML = "Terjadi kesalahan saat mengambil media.";
  }
});