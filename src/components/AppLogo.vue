<template>
  <div class="logo-wrap">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="22" fill="#1A1A2E" stroke="#6C63FF" stroke-width="2"/>
      <!-- 12 dots around the circle like clock positions -->
      <circle cx="24" cy="4" r="2.5" fill="#6C63FF"/>
      <circle cx="36" cy="7.5" r="2.2" fill="#6C63FF" opacity="0.9"/>
      <circle cx="44" cy="18" r="2" fill="#6C63FF" opacity="0.85"/>
      <circle cx="44" cy="30" r="2.2" fill="#6C63FF" opacity="0.8"/>
      <circle cx="36" cy="40.5" r="2.5" fill="#6C63FF" opacity="0.75"/>
      <circle cx="24" cy="44" r="2.2" fill="#6C63FF" opacity="0.7"/>
      <circle cx="12" cy="40.5" r="2" fill="#6C63FF" opacity="0.65"/>
      <circle cx="4" cy="30" r="2.2" fill="#6C63FF" opacity="0.6"/>
      <circle cx="4" cy="18" r="2.5" fill="#6C63FF" opacity="0.55"/>
      <circle cx="12" cy="7.5" r="2.2" fill="#6C63FF" opacity="0.5"/>
      <circle cx="19" cy="2.5" r="1.8" fill="#6C63FF" opacity="0.45"/>
      <circle cx="29" cy="2.5" r="1.8" fill="#6C63FF" opacity="0.4"/>
      <text x="24" y="28" text-anchor="middle" fill="#6C63FF" font-size="10" font-weight="bold" font-family="Inter,sans-serif">VM</text>
    </svg>
    <div class="logo-text">
      <span class="logo-name">Vis Metod</span>
      <span class="logo-sub">метод</span>
    </div>
  </div>
</template>

<style scoped>
.logo-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.logo-text {
  display: flex;
  flex-direction: column;
}
.logo-name {
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
}
.logo-sub {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>
