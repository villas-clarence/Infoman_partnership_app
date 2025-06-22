document.addEventListener('DOMContentLoaded', function () {
    const photoUpload = document.getElementById('photo-upload');
    const photoPreview = document.getElementById('photo-preview').querySelector('img');

    photoUpload.addEventListener('change', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                photoPreview.src = e.target.result;
                photoPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.src = '';
            photoPreview.style.display = 'none';
        }
    });
});
