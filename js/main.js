
(() => {
  [].slice.call(document.querySelectorAll('div.col-md-2'))
          .forEach(setMouse3DRotation);
})();

function setMouse3DRotation(el) {
  const css_3d = (persp, tZ, rX, rY) => {
    return `perspective(${persp}px) translateZ(${tZ}px) rotateX(${rX}deg) rotateY(${rY}deg)`;
  };

  // Animation parameters.
  const persp = 700;
  const aperture = 40.0;
  const tZ = 45;
  const finishDelay = 350;

  // Rotate the child object.
  const child = el.children[0];

  // Rest transform.
  el.onmouseleave = () => {
    child.style.transform = css_3d(persp, 0, 0, 0);
    child.style.transition = 
    child.style.webkitTransition = `all ${finishDelay}ms ease-out 60ms`;
  };

  // Motion transform.
  el.onmousemove = (m) => {  
    const dX = (m.layerX) / el.offsetWidth;
    const dY = (m.layerY) / el.offsetHeight;
    
    const rX = +(0.5 - dY) * aperture;
    const rY = -(0.5 - dX) * aperture;
    
    child.style.transform = css_3d(persp, tZ, rX, rY);
    child.style.transition =
    child.style.webkitTransition = 'none';
  };
}
