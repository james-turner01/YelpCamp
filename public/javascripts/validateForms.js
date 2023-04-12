// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'
    // initializes any file inputs using bs-custom-file-input
    bsCustomFileInput.init()

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.validated-form') //for all forms we want the validation to be applied to add the class 'validated-form' to them

    // Loop over them and prevent submission
    Array.from(forms) //make an array from forms with validated-form class
        .forEach(form => {
            form.addEventListener('submit', event => { //listens for a form to be submitted
                if (!form.checkValidity()) { //if a submitted form does NOT meet validity requirments
                    event.preventDefault() //prevent the event (submitting the form) from happening
                    event.stopPropagation() //stop propogation
                }

                form.classList.add('was-validated')
            }, false)
        })
})()