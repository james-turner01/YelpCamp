module.exports = func => {
    return (req, res, next) => {
        func(req, res, next)
            .catch(next)
    }
}

// creating a function t(func) that returns a function, that accepts a function.
// the function inside the returned function is then executed.
// The catch attached tot eh executing function will catch any errors and passes them to next