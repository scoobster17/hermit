/**
 * Serialize a form, returning a JSON object of key/value pairs based on the
 * names of input fields
 * @param  {Element} form   The form element being serialized
 * @return {Object}         Object containing names/values of all form fields
 */
export const serializeForm = (form) => {

    const formDetails = {};
    const formInputs = form.querySelectorAll('input[type="text"]');

    formInputs.forEach((input) => {
        formDetails[input.name] = input.value;
    });

    return formDetails;

};