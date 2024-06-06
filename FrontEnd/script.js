document.addEventListener('DOMContentLoaded', () => {
    const authLink = document.getElementById('auth-link');
    const editModeBanner = document.getElementById('edit-mode-banner');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.getElementsByClassName('close')[0];
    const uploadForm = document.getElementById('upload-form');
    const addPhotoButton = document.getElementById('add-photo');
    const photoGallery = document.getElementById('photo-gallery');
    const addPhotoContainer = document.getElementById('add-photo-container');
    const galleryTitle = document.getElementById('gallery-title');
    const separatorLine = document.getElementById('separator-line');
    const submitPhotoButton = document.getElementById('submit-photo');
    const photoFileUpload = document.getElementById('photo-file-upload');
    const editButton = document.getElementById('edit-button');
    const newPhotoTitle = document.getElementById('new-photo-title');
    const newPhotoCategory = document.getElementById('new-photo-category');
    const backArrow = document.getElementById('back-arrow');
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    // const uploadButton = document.getElementById('upload-button');

    const loggedIn = sessionStorage.getItem('loggedIn');
    const apiUrl = "http://localhost:5678/api/";

    
    // Validation connexion + modif bouton logout
    if (loggedIn === 'true') {
        authLink.innerHTML = '<a href="#" id="logout">logout</a>';
        editModeBanner.style.display = 'block';
        editButton.style.display = 'inline';

        document.getElementById('logout').addEventListener('click', function(event) {
            event.preventDefault();
            sessionStorage.removeItem('loggedIn');
            sessionStorage.removeItem('token')
            window.location.href = 'index.html';
        });

        // Ecouteur bouton Edition
        editButton.addEventListener('click', function() {
            editModal.style.display = 'block';
            fetchPhotos();
        });

        // Ecouteur bouton 'Ajouter une photo'
        addPhotoButton.addEventListener('click', function() {
            photoGallery.style.display = 'none';
            uploadForm.style.display = 'none';
            galleryTitle.style.display = 'none';
            separatorLine.style.display = 'none';
            addPhotoButton.style.display = 'none';
            addPhotoContainer.style.display = 'flex';
            fetchCategories(); // Récupérer les catégories lors de l'ajout de photo
        });

        // Ecouteur "élements d'ajout" 
        photoFileUpload.addEventListener('change', updateSubmitButtonState);
        newPhotoTitle.addEventListener('input', updateSubmitButtonState);
        newPhotoCategory.addEventListener('change', updateSubmitButtonState);

        submitPhotoButton.addEventListener('click', function(event) {
            event.preventDefault();
            const file = photoFileUpload.files[0];
            const title = newPhotoTitle.value;
            const category = newPhotoCategory.value;

            if (file && title && category) {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('title', title);
                formData.append('category', category);

                fetch(apiUrl + 'works', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    console.log('Photo ajoutée:', data);
                    const photoContainer = document.createElement('div');
                    const newPhoto = document.createElement('img');
                    newPhoto.src = URL.createObjectURL(file);
                    newPhoto.alt = title;
                    newPhoto.dataset.id = data.id;

                    const photoTitle = document.createElement('p');
                    photoTitle.textContent = title;

                    newPhoto.addEventListener('click', function() {
                        deletePhoto(data.id, photoContainer);
                    });

                    photoContainer.appendChild(newPhoto);
                    photoContainer.appendChild(photoTitle);
                    photoGallery.appendChild(photoContainer);

                    // Optionally reset the form and button styles after submission
                    photoFileUpload.value = '';
                    newPhotoTitle.value = '';
                    newPhotoCategory.value = '';
                    updateSubmitButtonState();
                })
                .catch(error => console.error('Error adding photo:', error));
            }
        });

        function updateSubmitButtonState() {
            if (photoFileUpload.files.length > 0 && newPhotoTitle.value && newPhotoCategory.value) {
                submitPhotoButton.style.backgroundColor = '#1D6154';
                submitPhotoButton.style.color = '#FFFEF8';
            } else {
                submitPhotoButton.style.backgroundColor = ''; // Reset to default
                submitPhotoButton.style.color = ''; // Reset to default
            }
        }

        // Empêche le comportement par défaut pour les événements de glisser-déposer
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
            document.body.addEventListener(eventName, preventDefaults, false);
        });

        // Ajoute et enlève une classe pour styliser la zone de dépôt pendant le glissement
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => dropZone.classList.remove('dragover'), false);
        });

        // Gestionnaire de dépôt de fichiers
        dropZone.addEventListener('drop', handleDrop, false);

        // Gestionnaire de changement pour le champ de fichier
        fileInput.addEventListener('change', handleFiles);

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            handleFiles({ target: { files } });
        }

        function handleFiles(e) {
            const files = e.target.files;

            if (files.length > 0) {
                const file = files[0];

                if (validateFile(file)) {
                    updateSubmitButtonState();
                    photoFileUpload.files = files; // Mise à jour de l'élément de téléchargement de fichier existant

                    const uploadLabel = document.querySelector('.upload-label');
                    const imagePreview = document.createElement('img');
                    imagePreview.src = URL.createObjectURL(file);
                    imagePreview.classList.add('upload-preview');
                    uploadLabel.innerHTML = '';
                    uploadLabel.appendChild(imagePreview);
                } else {
                    fileInput.value = ''; // Réinitialiser si la validation échoue
                }
            }
        }

        function validateFile(file) {
            const validTypes = ['image/jpeg', 'image/png'];
            const maxSizeInBytes = 4 * 1024 * 1024; // 4MB in bytes

            if (!validTypes.includes(file.type)) {
                alert('Veuillez sélectionner un fichier JPG ou PNG.');
                return false;
            }
            if (file.size > maxSizeInBytes) {
                alert('Le fichier doit faire moins de 4 Mo.');
                return false;
            }
            return true;
        }

        photoFileUpload.addEventListener('change', () => {
            const file = photoFileUpload.files[0];
            if (file && validateFile(file)) {
                updateSubmitButtonState();
            } else {
                photoFileUpload.value = ''; // Reset file input if validation fails
            }
        });

        backArrow.addEventListener('click', function() {
            photoGallery.style.display = 'flex';
            addPhotoContainer.style.display = 'none';
            galleryTitle.style.display = 'block';
            separatorLine.style.display = 'block';
            addPhotoButton.style.display = 'block';
        });

        closeModal.onclick = function() {
            editModal.style.display = 'none';
        };

        window.onclick = function(event) {
            if (event.target === editModal) {
                editModal.style.display = 'none';
            }
        };

        document.getElementById('photo-file-upload').addEventListener('change', function(event) {
            const file = event.target.files[0];
            const uploadLabel = document.querySelector('.upload-label');
            // Créez un nouvel élément img
            const imagePreview = document.createElement('img');
            // Définissez l'attribut src de l'image sur l'URL de l'image sélectionnée
            imagePreview.src = URL.createObjectURL(file);
            // Ajoutez la classe pour le style CSS, si nécessaire
            imagePreview.classList.add('upload-preview');

            // Effacez le contenu précédent de l'élément label
            uploadLabel.innerHTML = '';
            // Ajoutez l'image en tant qu'enfant de l'élément label
            uploadLabel.appendChild(imagePreview);
        });

        function fetchPhotos() {
            fetch(apiUrl + 'works')
                .then(response => response.json())
                .then(data => {
                    photoGallery.innerHTML = '';
                    data.forEach(photo => {
                        const photoContainer = document.createElement('div');
                        const imgElement = document.createElement('img');
                        imgElement.src = photo.imageUrl;
                        imgElement.alt = photo.title;
                        imgElement.dataset.id = photo.id;

                        const photoTitle = document.createElement('p');
                        photoTitle.textContent = photo.title;

                        const deleteIcon = document.createElement('i');
                        deleteIcon.classList.add('fa-solid', 'fa-trash');
                        deleteIcon.style.color = 'white';
                        deleteIcon.style.position = 'absolute';
                        deleteIcon.style.top = '5px';
                        deleteIcon.style.right = '5px';
                        deleteIcon.style.cursor = 'pointer';
                        deleteIcon.style.backgroundColor = 'black'; // Ajoutez le fond noir
                        deleteIcon.style.padding = '5px'; // Ajoutez du padding pour agrandir la zone de fond
                        deleteIcon.addEventListener('click', function() {
                            deletePhoto(photo.id, photoContainer);
                        });

                        photoContainer.style.position = 'relative';
                        photoContainer.appendChild(imgElement);
                        photoContainer.appendChild(deleteIcon);
                        photoGallery.appendChild(photoContainer);
                    });
                })
                .catch(error => console.error('Error fetching photos:', error));
        }

        function fetchCategories() {
            fetch(apiUrl + 'categories')
                .then(response => response.json())
                .then(data => {
                    // Vider les options existantes avant d'ajouter les nouvelles
                    newPhotoCategory.innerHTML = '';

                    // Ajouter une option par défaut
                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = '';
                    newPhotoCategory.appendChild(defaultOption);

                    data.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.id;
                        option.textContent = category.name;
                        newPhotoCategory.appendChild(option);
                    });
                })
                .catch(error => console.error('Error fetching categories:', error));
        }

        function deletePhoto(photoId, photoElement) {
            fetch(apiUrl + 'works/' + photoId, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log('Photo deleted:', photoId);
                    photoGallery.removeChild(photoElement);
                } else {
                    console.error('Error deleting photo:', response.statusText);
                }
            })
            .catch(error => console.error('Error deleting photo:', error));
        }
    }
});

getWorks();

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
