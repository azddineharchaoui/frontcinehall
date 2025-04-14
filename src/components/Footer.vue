<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-logo">CineHall</div>
        <div class="footer-links">
          <a href="#" class="footer-link">À Propos</a>
          <a href="#" class="footer-link">Contact</a>
          <a href="#" class="footer-link">Conditions d'utilisation</a>
          <a href="#" class="footer-link">Politique de confidentialité</a>
        </div>
        <div class="social-links">
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">Twitter</a>
          <a href="#" class="social-link">Instagram</a>
        </div>
      </div>
      <div class="copyright">
        &copy; {{ new Date().getFullYear() }} CineHall - Tous droits réservés
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--secondary-color);
  color: var(--light-text);
  padding: 30px 0 20px;
  margin-top: 40px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary-color);
}

.footer-links, .social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.footer-link, .social-link {
  color: var(--light-text);
  text-decoration: none;
  transition: color 0.3s;
}

.footer-link:hover, .social-link:hover {
  color: var(--primary-color);
}

.copyright {
  text-align: center;
  font-size: 0.9rem;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 15px;
  }
}
</style>