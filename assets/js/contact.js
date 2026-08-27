
document.addEventListener('DOMContentLoaded',()=>{const form=document.getElementById('contactForm');form.addEventListener('submit',e=>{e.preventDefault();if(!form.checkValidity()){form.classList.add('was-validated');return;}form.classList.add('d-none');document.getElementById('contactSuccess').classList.remove('d-none');});});
