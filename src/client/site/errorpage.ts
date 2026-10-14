export const initErrorPath = (): void => {
  for (const id of ["error-path", "error-path-2"]) {
    const node = document.getElementById(id);
    if (node) node.textContent = window.location.pathname;
  }
};
