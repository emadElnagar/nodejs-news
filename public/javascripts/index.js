const elements = document.querySelectorAll("footer li a");
elements.forEach((el) => {
  el.onmouseover = () => {
    el.classList.remove('text-light');
    el.classList.add('text-warning');
  }
  el.onmouseout = () => {
    el.classList.add('text-light');
    el.classList.remove('text-warning');
  }
});
