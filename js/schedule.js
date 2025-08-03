const form = document.getElementById('booking-form');
const successMsg = form.querySelector('.success-message');
const errorMsg = form.querySelector('.error-message');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            successMsg.style.display = 'block';
            errorMsg.style.display = 'none';
            form.reset();
        } else {
            throw new Error('Network response was not ok');
        }
    } catch (error) {
        successMsg.style.display = 'none';
        errorMsg.style.display = 'block';
    }
});