const themeKey = "romantic-site-theme";
const photoInput = document.querySelector("#photoInput");
const photoGrid = document.querySelector("#photoGrid");

function restoreTheme() {
  try {
    const savedTheme = localStorage.getItem(themeKey);
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme;
    }
  } catch {
    document.documentElement.dataset.theme = "rose";
  }
}

function createPhotoCard(file) {
  const imageUrl = URL.createObjectURL(file);
  const card = document.createElement("article");
  const title = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");

  card.className = "photo-card uploaded-card";
  card.innerHTML = `
    <figure class="uploaded-frame">
      <img src="${imageUrl}" alt="">
    </figure>
    <h2></h2>
    <p>Ditambahkan dari perangkatmu</p>
  `;

  card.querySelector("h2").textContent = title || "New memory";
  if (photoGrid) photoGrid.prepend(card);
}

if (photoInput) {
  photoInput.addEventListener("change", () => {
    [...photoInput.files].forEach((file) => {
      if (file.type.startsWith("image/")) {
        createPhotoCard(file);
      }
    });
    photoInput.value = "";
  });
}

restoreTheme();
