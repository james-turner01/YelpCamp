const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

//creating our extension on Joi.string() called escapeHTML that ensures string input does NOT include any html
const extension = (joi) => ({
    type: 'string',
    base: joi.string(), //our extension works on joi.string()s
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: { //extension is called escapeHTML
            validate(value, helpers) { //function called validate, Joi will call this automatically with whatever 'value' it receives
                // using a npm pacakge called sanitize-html https://www.npmjs.com/package/sanitize-html
                const clean = sanitizeHtml(value, { // clean = the sanitized html. clean shoudl === value by the time sanitizeHtml has executed
                    allowedTags: [], // no html tags or attributes are allowed
                    allowedAttributes: {},
                });
                // if value and clean do not match, then something has been removed so return string.escapeHTML message
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

//adding our extension to BaseJoi so we can use it in our Joi schema below
// so now we can use escapeHTML extension we made above
const Joi = BaseJoi.extend(extension);



// defining JOI schema to validate req.body
// and exporting it
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(), // .uri(), //.uri ensures a valid url is input
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(), //expect campground to be an object and it is required
    //deleteImages is an array that is NOT required
    deleteImages: Joi.array()
});

//creating JOI schema to validate req.body of a submitted review
// adn exporting it
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required() //expects review o be an object that is required
})