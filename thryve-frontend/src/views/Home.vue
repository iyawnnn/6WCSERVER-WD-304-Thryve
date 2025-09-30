<template>
  <div class="home">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content dark-mode">
        <!-- Left: Logo -->
        <div class="navbar-left">
          <img
            src="../assets/uploads/symbol.svg"
            alt="Logo"
            class="navbar-logo"
          />
          <span class="navbar-title">THRYVE</span>
        </div>

        <!-- Right: CTA + Avatar -->
        <div class="navbar-right">
          <a href="/register" class="nav-action">Join Now</a>

          <!-- Avatar (fallback = generic) -->
          <div class="avatar" onclick="window.location.href='/login'">
            <img src="../assets/uploads/avatar.svg" alt="Login" />
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero" data-theme="light">
      <div class="hero-text">
        <p class="tagline-small">ACHIEVE YOUR FITNESS GOALS</p>
        <h1 class="headline">FIND YOUR<br />STRENGTH</h1>
      </div>
      <div class="hero-image" data-theme="dark">
        <img src="../assets/uploads/hero1.svg" alt="Fitness" />
        <div class="overlay-text">
          <h2 class="text-in-image">
            INSIDE<br /><span class="no-break">AND OUT.</span>
          </h2>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="mission" data-theme="light">
      <h3 class="mission-heading">FITNESS SHOULD BE ACCESSIBLE TO EVERYONE.</h3>
      <p>
        Whether you're just starting out or a seasoned athlete, Thryve helps you
        stay on top of your health by tracking nutrition, workouts, sleep, and
        hydration in one seamless platform.
      </p>
      <router-link to="/register" class="cta-button">GET STARTED</router-link>
    </section>

    <!-- Mission Icon -->
    <div class="mission-icon-wrapper">
      <img
        src="../assets/uploads/element.svg"
        alt="Mission Icon"
        class="mission-icon"
        data-theme="light"
      />
    </div>

    <!-- Features Section -->
    <section class="features" data-theme="light">
      <div class="features-header">
        <h2><span>ONE APP, TOTAL WELLNESS</span></h2>
        <p>
          Track your meals, workouts, sleep, and hydration all in one place.
        </p>
      </div>

      <div class="features-grid">
        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-basket-fill"></i></div>
          <div class="feature-text">
            <h3>Meal Tracking</h3>
            <p>Log your meals and hit your nutrition goals with ease.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-lightning-charge"></i></div>
          <div class="feature-text">
            <h3>Workout Tracking</h3>
            <p>Track your workouts and measure your progress over time.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-moon-fill"></i></div>
          <div class="feature-text">
            <h3>Sleep Monitoring</h3>
            <p>Understand your sleep patterns for better recovery.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-droplet-fill"></i></div>
          <div class="feature-text">
            <h3>Hydration Intake</h3>
            <p>Stay on top of your daily water intake with reminders.</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-flag-fill"></i></div>
          <div class="feature-text">
            <h3>Personal Goals</h3>
            <p>
              Set and track your own fitness and wellness goals tailored just
              for you.
            </p>
          </div>
        </div>

        <div class="feature-item">
          <div class="icon-box"><i class="bi bi-graph-up"></i></div>
          <div class="feature-text">
            <h3>Progress Reports</h3>
            <p>Visualize your growth with weekly and monthly reports.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="closing" data-theme="dark">
      <img
        src="../assets/uploads/element.svg"
        alt="Mission Icon"
        class="mission-icon-footer"
        data-theme="dark"
      />
      <h2 class="closing-title">
        YOUR BODY IS<br />
        YOUR TEMPLE
      </h2>
      <p class="closing-subtitle">
        Take control of your health today. Set your goals, track your progress,
        and enjoy a healthier, happier lifestyle.
      </p>
      <router-link to="/register" class="footer-button"
        >SIGN UP NOW</router-link
      >
    </section>
  </div>
</template>

<script>
export default {
  name: "Home",
  data() {
    return {
      rafId: null,
    };
  },
  mounted() {
    // keep hero full-height on desktop
    this.setHeroHeight();
    window.addEventListener("resize", this.setHeroHeight);

    // initialize nav contrast and add listeners
    this.updateNavContrast();
    this._boundOnScroll = this.onScroll.bind(this);
    window.addEventListener("scroll", this._boundOnScroll, { passive: true });
    window.addEventListener("resize", this._boundOnScroll);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.setHeroHeight);
    window.removeEventListener("scroll", this._boundOnScroll);
    window.removeEventListener("resize", this._boundOnScroll);
    if (this.rafId) cancelAnimationFrame(this.rafId);
  },
  methods: {
    setHeroHeight() {
      const hero = this.$el.querySelector(".hero");
      if (!hero) return;
      // apply only on desktop widths
      if (window.innerWidth >= 1024) {
        hero.style.height = window.innerHeight + "px";
      } else {
        hero.style.height = "";
      }
    },

    onScroll() {
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this.updateNavContrast();
      });
    },

    data() {
      return {
        lastTheme: "dark",
        rafId: null,
      };
    },
    updateNavContrast() {
      const nav = this.$el.querySelector(".navbar-content");
      const navRect = this.$el.querySelector(".navbar").getBoundingClientRect();
      const x = navRect.left + navRect.width / 2;
      const y = navRect.bottom + 2;
      const elBelow = document.elementFromPoint(x, y);
      const section =
        elBelow?.closest("[data-theme]") || elBelow?.closest("section");
      const theme = section?.getAttribute("data-theme") || this.lastTheme;

      if (theme !== this.lastTheme) {
        this.lastTheme = theme;
        if (theme === "light") {
          nav.classList.add("light-mode");
          nav.classList.remove("dark-mode");
        } else {
          nav.classList.remove("light-mode");
          nav.classList.add("dark-mode");
        }
      }
    },
  },
};
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.navbar {
  position: sticky;
  top: 1rem;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: 0 1rem;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(14px) saturate(180%);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  border-radius: 999px;
  padding: 0.75rem 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  max-width: 900px;
  width: 90%;
}

.navbar-content.dark-mode .nav-action {
  background: var(--primary);
  color: white;
}

.navbar-left,
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-title {
  font-family: "Geist", "Poppins", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: currentColor;
  letter-spacing: -0.025;
}

.navbar-content.light-mode .navbar-title {
  color: #000;
}

.navbar-content.dark-mode .navbar-title {
  color: #fff;
}

.navbar-content.dark-mode .navbar-logo {
  filter: invert(1) brightness(1.2);
}

.navbar-logo {
  width: 3rem;
  height: 2rem;
  color: white;
  flex-shrink: 0;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-action {
  font-family: "Geist", sans-serif;
  background: #000;
  color: #fff;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.nav-action:hover {
  background: #585656;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  transition: border-color 0.2s ease;
}

.avatar:hover {
  border-color: #000;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Hero Section */
.hero,
.mission,
.features,
.closing {
  opacity: 0;
  animation: fadeIn 1s ease forwards;
  animation-delay: 0.2s;
}

.hero {
  min-height: 100vh;
  height: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  gap: 1rem;
  padding: 3.5rem 0 0;
  box-sizing: border-box;
}

.hero-text {
  flex: unset;
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero .headline {
  font-size: 7.5rem;
  margin: 0;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
}

.hero-image {
  flex: unset;
  height: 55vh;
  max-height: 55vh;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0 0.75rem;
  overflow: hidden;
  border-radius: 35px;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 35px;
}

.overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #fff;
  text-align: center;
}

.overlay-text h2 {
  font-size: 7.5rem;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
  text-shadow: 0px 4px 12px rgba(0, 0, 0, 0.25);

  display: inline-block;   
  text-align: center;      
}

.no-break {
  white-space: nowrap;    
}

/* Mission Section */
.mission {
  padding: 50px 20px;
  max-width: 750px;
  margin: 0 auto;
  text-align: center;
}

.mission h3 {
  font-family: "Geist", sans-serif;
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 20px;
  color: #000;
  text-transform: uppercase;
  letter-spacing: -0.025;
}

.mission p {
  font-size: 1.1rem;
  font-weight: 300;
  margin-bottom: 40px;
  color: var(--secondary-hover);
  line-height: 1.6;
}

.cta-button {
  display: inline-block;
  padding: 0.75rem 2rem;
  font-family: "Geist", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #000;
  border: 2px solid #000;
  border-radius: 50px;
  background: transparent;
  text-decoration: none;
  transition: all 0.5s ease;
  max-width: 240px;
  width: 100%;
  text-align: center;
}

.cta-button:hover {
  color: #fff;
  background-color: #000;
}

.mission-icon-wrapper {
  display: flex;
  justify-content: center;
  padding: 2rem; 
  animation: fadeIn 1.2s ease forwards;
}

.mission-icon {
  max-width: 120px;
  height: auto;
  animation: spin 5s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Features Section */
.features {
  padding: 5rem 2rem;
  background: #fff;
  text-align: center;
  max-width: 1400px;
  margin: 0 auto;
}

.features-header h2 {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: #111;
}

.features-header p {
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  justify-content: center;
  justify-items: center;
  align-items: start;
}

.feature-item {
  border-radius: 12px;
  padding: 2rem 1.5rem;
  transition: transform 0.3s ease;
  width: 300px;
}

.feature-item:hover {
  transform: translateY(-2px);
}

.icon-box {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  margin: 0 auto 1rem;
}

.feature-text h3 {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.feature-text p {
  font-size: 1rem;
  color: #555;
  line-height: 1.4;
}

.mission-icon-footer {
  filter: invert(1);
  width: 120px;
  height: auto;
  margin-bottom: 3rem;
}

.closing {
  padding: 6rem 2rem;
  background: #111;
  color: #fff;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.closing-title {
  font-size: 7rem;
  font-weight: 900;
  line-height: 0.85;
  margin-bottom: 0.5rem;
}

.closing-subtitle {
  font-size: 1.25rem;
  color: #ddd;
  max-width: 600px;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.footer-button {
  display: inline-block;
  padding: 14px 40px;
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
  border-radius: 50px;
  font-weight: 700;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.footer-button:hover {
  background: #fff;
  color: #111;
}

.feature-item {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeIn 1s ease forwards;
}

.feature-item:nth-child(1) {
  animation-delay: 0.2s;
}
.feature-item:nth-child(2) {
  animation-delay: 0.4s;
}
.feature-item:nth-child(3) {
  animation-delay: 0.6s;
}
.feature-item:nth-child(4) {
  animation-delay: 0.8s;
}
.feature-item:nth-child(5) {
  animation-delay: 1s;
}
.feature-item:nth-child(6) {
  animation-delay: 1.2s;
}

@media (max-width: 1095px) {
  .hero .headline {
    font-size: 6rem;
  }
  .overlay-text h2 {
    font-size: 6rem;
  }
  .mission h3 {
    font-size: 2.5rem;
  }

  .hero {
    gap: 0;
  }
}

/* Tablet */
@media (max-width: 1024px) {
  .hero .headline {
    font-size: 5rem;
  }

  .hero-image {
    height: 45vh;  
    max-height: 45vh;
  }
  .overlay-text h2 {
    font-size: 5rem;
  }

  .mission {
    padding-top: 0;
  }
}

@media (max-width: 925px) {
  .features {
    padding: 3rem;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  .feature-item {
    padding: 1.5rem 1rem;
    width: 100%;
    max-width: 300px;
  }

  .feature-text h3 {
    font-size: 1.5rem;
  }

  .feature-text p {
    font-size: 0.95rem;
  }

  .icon-box {
    width: 80px;
    height: 80px;
    font-size: 1.5rem;
  }

  .features-header h2 {
    font-size: 2rem; 
  }

  .features-header p {
    font-size: 1rem; 
  }

  .closing-title {
    font-size: 6rem;
  }
}

@media (max-width: 885px) {
  .hero .headline {
    font-size: 5rem;
  }
  .overlay-text h2 {
    font-size: 5rem;
  }
}

@media (max-width: 768px) {

  .mission-icon {
    max-width: 70px;
  }

  .hero {
    min-height: 0;
  }

  .mission {
    padding-top: 6rem;
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .hero-image {
    height: 45vh;   
    max-height: 45vh;
  }

  .overlay-text h2 {
    line-height: 1;
    text-align: center;
    white-space: nowrap;
    display: inline-block; 
  }

  .overlay-text {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  .mission h3 {
    font-size: 2rem;
  }

  .closing-title {
    font-size: 4rem;
  }

  .mission-icon-footer {
    width: 120px;
    height: 120px;
  }

  .closing-subtitle {
    font-size: 1.5;
  }

  .cta-button {
    padding: 0.6rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 600px) {
  .hero .headline {
    font-size: 3.5rem;   
    line-height: 1;
  }

  .hero-image {
    height: 35vh;        
    max-height: 35vh;
  }

  .overlay-text h2 {
    font-size: 3.5rem;     
    line-height: 1.1;
  }

  .tagline-small {
    font-size:0.75rem;
  }

  .mission {
    padding-top:5rem;
  }

  .mission-heading {
    font-size: 4rem
  }
}

@media (max-width: 480px) {
    .hero-image {
    height: 30vh;   
    max-height: 30vh;
  }
  .overlay-text h2 {
    font-size: 2.8rem;
  }

  .mission-icon {
    max-width: 50px;
  }

  .hero .headline {
    font-size: 2.8rem;
  }

  .mission {
    padding: 3rem;
    padding-top: 5rem;
  }

  .mission h3 {
    font-size: 1.7rem;
  }

  .cta-button {
    padding: 0.5rem 1.2rem;
    font-size: 0.9rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .navbar {
    top: 0.5rem; 
    padding: 0 0.5rem;
  }

  .navbar-content {
    padding: 0.5rem 1rem;
    gap: 1rem;
    width: 100%;
    max-width: 100%;
  }

  .navbar-logo {
    width: 2rem;
    height: 1.5rem;
  }

  .navbar-title {
    font-size: 0.9rem;
    letter-spacing: -0.01rem;
  }

  .navbar-left {
    gap: 0.25rem;
  }

  .navbar-right {
    gap: 0.5rem;
  }

  .nav-action {
    padding: 0.4rem 0.9rem;
    font-size: 0.8rem;
  }

  .avatar {
    width: 32px;
    height: 32px;
  }

}
</style>
