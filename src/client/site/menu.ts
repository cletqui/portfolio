export const initMobileMenu = (): void => {
  const button = document.getElementById("mobile-menu-btn");
  const menu = document.getElementById("mobile-menu");
  if (!button || !menu) return;
  button.addEventListener("click", () => {
    const hidden = menu.classList.toggle("hidden");
    button.setAttribute("aria-expanded", String(!hidden));
  });
};
