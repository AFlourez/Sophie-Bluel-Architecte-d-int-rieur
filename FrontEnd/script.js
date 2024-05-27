function getWorks() {
  fetch('http://localhost:5678/api/works')
    .then(response => {
      if (!response.ok) {
        throw new Error('La requête a échoué avec le statut ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      const result = data.map(element => element.category.name);
      const uniqueCategories = Array.from(new Set(result));
      uniqueCategories.push("Tous");

      const sortedCategories = uniqueCategories.sort((a, b) => a.length - b.length);
      createButtons(sortedCategories);
      populateGallery(data);
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
}

function createButtons(categories) {
  const filterContainer = document.getElementById('filter-container');

  categories.forEach(category => {
    const button = document.createElement('button');
    button.textContent = category;
    button.addEventListener('click', () => {
      filterItemsByCategory(category);
    });
    filterContainer.appendChild(button);
  });
}

function populateGallery(data) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = ''; // Clear existing content

  data.forEach(item => {
    const figure = document.createElement('figure');
    figure.classList.add(`category-${item.category.name.replace(/\s+/g, '-')}`);

    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.title;

    const figcaption = document.createElement('figcaption');
    figcaption.textContent = item.title;

    figure.appendChild(img);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
  });
}

function filterItemsByCategory(category) {
  const galleryItems = document.querySelectorAll('.gallery figure');

  galleryItems.forEach(item => {
    const itemCategory = item.classList[0]; 
    if (category === 'Tous' || itemCategory === `category-${category.replace(/\s+/g, '-')}`) {
      item.style.display = '';
    } else {
      item.style.display = 'none';
    }
  });
}

getWorks();