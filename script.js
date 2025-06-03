document.addEventListener("DOMContentLoaded", function () {
  const elements = document.querySelectorAll(".hidden");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        } else {
          // Untuk animasi berulang saat scroll ke atas dan ke bawah lagi:
          // entry.target.classList.remove("show");
        }
      });
    },
    { threshold: 0.1 } 
  );
  elements.forEach((element) => {
    if (element) { // Pastikan elemen ada sebelum diobservasi
        observer.observe(element);
    }
  });

  // Animated Horizontal Rules (Jika masih digunakan, pastikan class .animated-hr ada di HTML)
  const hrElements = document.querySelectorAll(".animated-hr"); 
  if (hrElements.length > 0) {
    function checkScrollAndAnimateHR() {
      const screenHeight = window.innerHeight;
      hrElements.forEach((hrElement) => {
        const position = hrElement.getBoundingClientRect().top;
        if (position < screenHeight * 0.85) {
          hrElement.classList.add("active");
        } else {
          // hrElement.classList.remove("active");
        }
      });
    }
    window.addEventListener("scroll", checkScrollAndAnimateHR);
    checkScrollAndAnimateHR(); // Panggil saat load
  }

  // Dynamic Island Menu Scroll Logic
  const siteHeader = document.querySelector(".site-header");
  const scrollThreshold = 100; // Pixels to scroll before menu changes (can be adjusted)

  if (siteHeader) {
    let lastScrollTop = 0;
    window.addEventListener("scroll", function () {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > scrollThreshold) {
        siteHeader.classList.add("scrolled");
      } else {
        siteHeader.classList.remove("scrolled");
      }
      // Optional: Hide menu on scroll down, show on scroll up when scrolled
      // if (siteHeader.classList.contains("scrolled")) {
      //   if (scrollTop > lastScrollTop) {
      //     // Downscroll
      //     siteHeader.style.top = "-100px"; // Adjust to hide menu
      //   } else {
      //     // Upscroll
      //     siteHeader.style.top = "20px"; // Adjust to show menu
      //   }
      // }
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    }, false);
  }

  // Hamburger Menu Toggle Functionality
  const menuToggle = document.querySelector(".mobile-menu-toggle");
  const mainNav = document.getElementById("mainNav");
  const body = document.body;

  if (menuToggle && mainNav) {
      menuToggle.addEventListener("click", function () {
          mainNav.classList.toggle("mobile-menu--open");
          const isExpanded = mainNav.classList.contains("mobile-menu--open");
          menuToggle.setAttribute("aria-expanded", isExpanded.toString());
          
          const icon = menuToggle.querySelector("i");
          if (isExpanded) {
              icon.classList.remove("fa-bars");
              icon.classList.add("fa-times");
              body.style.overflow = 'hidden'; // Mencegah scroll di latar belakang
          } else {
              icon.classList.remove("fa-times");
              icon.classList.add("fa-bars");
              body.style.overflow = ''; // Mengembalikan scroll
          }
      });

      // Menutup menu ketika link di dalam menu diklik
      const navLinks = mainNav.querySelectorAll("a");
      navLinks.forEach(link => {
          link.addEventListener("click", () => {
              if (mainNav.classList.contains("mobile-menu--open")) {
                  mainNav.classList.remove("mobile-menu--open");
                  menuToggle.setAttribute("aria-expanded", "false");
                  const icon = menuToggle.querySelector("i");
                  icon.classList.remove("fa-times");
                  icon.classList.add("fa-bars");
                  body.style.overflow = ''; // Mengembalikan scroll
              }
          });
      });
  }


  // Project Carousel
  const trackContainer = document.querySelector(".carousel-track-container");
  const track = document.querySelector(".carousel-track");

  if (track && trackContainer) {
    const slides = Array.from(track.children).filter(child => child.classList.contains('project-card'));
    const nextButton = document.querySelector(".carousel-button.next");
    const prevButton = document.querySelector(".carousel-button.prev");
    
    let cardGap = 0;
    let slideWidth = 0;
    let currentIndex = 0;
    
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationFrameId;

    function updateCarouselDimensions() {
      if (slides.length === 0) return;
      slideWidth = slides[0].offsetWidth;
      const trackStyle = window.getComputedStyle(track);
      cardGap = parseFloat(trackStyle.gap) || 30; // Default gap jika tidak terdefinisi

      currentTranslate = -currentIndex * (slideWidth + cardGap);
      setTrackPositionInstantly(currentTranslate); 
      updateButtonStates();
    }

    function setTrackPosition(translateX) {
      track.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)';
      track.style.transform = `translateX(${translateX}px)`;
    }
    
    function setTrackPositionInstantly(translateX) {
      track.style.transition = 'none'; 
      track.style.transform = `translateX(${translateX}px)`;
      void track.offsetWidth; // Memicu reflow untuk memastikan transisi instan
      track.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)'; // Kembalikan transisi
    }


    function moveToSlide(targetIndex) {
      if (slides.length === 0) return;
      
      // Batasi targetIndex agar tidak keluar dari rentang slide yang ada
      const newIndex = Math.max(0, Math.min(targetIndex, slides.length - 1));
      
      // Hitung posisi translate baru
      const newTranslate = -newIndex * (slideWidth + cardGap);
      setTrackPosition(newTranslate);
      
      currentTranslate = newTranslate;
      prevTranslate = newTranslate; // Simpan posisi saat ini untuk drag berikutnya
      currentIndex = newIndex;
      updateButtonStates();
    }
    
    function updateButtonStates() {
      if (!nextButton || !prevButton) return;
      prevButton.disabled = currentIndex === 0;
      // Tombol next dinonaktifkan jika slide terakhir terlihat.
      // Perlu dihitung berapa banyak slide yang terlihat sekaligus jika container tidak selebar 1 slide.
      // Untuk kasus ini, kita asumsikan 1 slide terlihat penuh pada satu waktu.
      nextButton.disabled = currentIndex >= slides.length - 1; 
    }

    if (nextButton && prevButton) {
      nextButton.addEventListener("click", () => {
        if (currentIndex < slides.length - 1) {
          moveToSlide(currentIndex + 1);
        }
      });

      prevButton.addEventListener("click", () => {
        if (currentIndex > 0) {
          moveToSlide(currentIndex - 1);
        }
      });
    }
    
    // Fungsi Drag and Swipe untuk Carousel
    function dragStart(event) {
      if (slides.length <= 1) return; // Tidak perlu drag jika hanya 1 slide atau kurang
      isDragging = true;
      startPos = getPositionX(event);
      prevTranslate = currentTranslate; // Simpan posisi translate saat ini
      track.style.transition = 'none'; // Hapus transisi sementara saat drag
      if (event.type === 'mousedown') event.preventDefault(); // Mencegah seleksi teks saat drag mouse
      cancelAnimationFrame(animationFrameId); // Batalkan frame animasi sebelumnya jika ada
    }

    function drag(event) {
      if (isDragging) {
        const currentPosition = getPositionX(event);
        const diff = currentPosition - startPos;
        currentTranslate = prevTranslate + diff;
        
        // Gunakan requestAnimationFrame untuk performa yang lebih baik
        animationFrameId = requestAnimationFrame(() => {
            setTrackPositionInstantly(currentTranslate);
        });
      }
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      cancelAnimationFrame(animationFrameId);
      track.style.transition = 'transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)'; // Kembalikan transisi

      const movedBy = currentTranslate - prevTranslate;
      const threshold = slideWidth / 4; // Ambang batas untuk pindah slide (25% dari lebar slide)

      // Tentukan apakah akan pindah ke slide berikutnya atau sebelumnya
      if (movedBy < -threshold && currentIndex < slides.length - 1) {
        currentIndex++;
      } else if (movedBy > threshold && currentIndex > 0) {
        currentIndex--;
      }
      moveToSlide(currentIndex); // Pindah ke slide yang ditentukan (atau tetap jika tidak melewati threshold)
    }

    function getPositionX(event) {
      return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
    }
    
    // Tambahkan event listener untuk drag/swipe
    if (track) {
        // Mouse events
        track.addEventListener("mousedown", dragStart);
        // Touch events
        track.addEventListener("touchstart", dragStart, { passive: true }); // passive: true untuk performa scroll

        // Event listener pada document untuk menangani drag di luar track
        document.addEventListener("mouseup", dragEnd); 
        document.addEventListener("mouseleave", dragEnd); // Jika mouse keluar dari browser window
        document.addEventListener("touchend", dragEnd);

        document.addEventListener("mousemove", drag);
        document.addEventListener("touchmove", drag, { passive: true }); // passive: true untuk performa scroll
    }


    // Inisialisasi carousel
    if (slides.length > 0) {
      updateCarouselDimensions(); // Panggil sekali untuk mengatur dimensi awal
      moveToSlide(0); // Mulai dari slide pertama
    }
    window.addEventListener("resize", updateCarouselDimensions); // Update dimensi saat ukuran window berubah
  }


  // Update tahun di footer
  const currentYearSpan = document.getElementById("currentYear");
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }
});
