/**
 * Utilitas untuk kompresi gambar di sisi klien (Browser)
 * Memastikan gambar tetap jernih namun berukuran jauh lebih ringan.
 */

export const compressImage = async (file, { maxWidth = 1600, maxHeight = 1600, quality = 0.8 } = {}) => {
  return new Promise((resolve, reject) => {
    // Hanya kompres jika file adalah gambar dan bukan GIF (GIF animasi sulit dikompres via canvas)
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Hitung rasio untuk mempertahankan proporsi
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Gunakan imageSmoothingEnabled untuk hasil yang lebih tajam
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export ke WebP (lebih ringan) dengan fallback JPEG
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
        
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas toBlob failed'));
            }
            // Kembalikan file baru dengan nama asli tapi ukuran lebih kecil
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });
            
            // Log perbandingan ukuran (untuk debug/informasi)
            console.log(`[Compression] ${file.name}: ${(file.size / 1024).toFixed(2)}KB -> ${(compressedFile.size / 1024).toFixed(2)}KB`);
            
            resolve(compressedFile);
          },
          outputType,
          quality
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
