
document.addEventListener('DOMContentLoaded',()=>{const input=document.getElementById('faqSearch');input.addEventListener('input',()=>{const q=input.value.toLowerCase();document.querySelectorAll('[data-faq-item]').forEach(item=>item.classList.toggle('d-none',!item.textContent.toLowerCase().includes(q)));});});
