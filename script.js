function compressImages() {
    const fileInput = document.getElementById('fileInput');
    const downloadLink = document.getElementById('downloadLink');
    const imageContainer = document.getElementById('imageContainer');
    
    // Limpiar contenedor de imágenes antes de agregar nuevas
    imageContainer.innerHTML = '';
    
    const files = fileInput.files;
    if (files.length === 0) {
        alert('Por favor, selecciona al menos una imagen.');
        return;
    }
    
    const zip = new JSZip();
    const promises = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const promise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const maxWidth = 800; // Máximo ancho permitido para la imagen comprimida
                    const maxHeight = 600; // Máximo alto permitido para la imagen comprimida
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // Calidad de compresión (0.7)
                    
                    const imgBlob = dataURItoBlob(compressedDataUrl);
                    zip.file(`imagen_${i + 1}.jpg`, imgBlob);
                    
                    const imgElement = document.createElement('img');
                    imgElement.src = compressedDataUrl;
                    imageContainer.appendChild(imgElement);
                    
                    resolve();
                };
            };
            reader.readAsDataURL(file);
        });
        promises.push(promise);
    }
    
    Promise.all(promises).then(() => {
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const url = URL.createObjectURL(blob);
            downloadLink.href = url;
            downloadLink.style.display = 'block';
        });
    });
}

function clearImages() {
    const imageContainer = document.getElementById('imageContainer');
    imageContainer.innerHTML = '';
}

function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}