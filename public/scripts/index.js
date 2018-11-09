
const toggleButtons = Array.from(document.querySelectorAll('[data-toggle-trigger]'));

function ajaxToggle(form) {
  fetch(form.action, {
    method: 'POST'
  }).then(() => {
      console.log(`succesfully toggled ${form.action}`);
    });
}

toggleButtons.forEach(button => {
  console.log('adding button listener');
  button.addEventListener('change', (e) => {
    console.log('you just changed the checkbox');
    ajaxToggle(e.target.form);
  });
});


