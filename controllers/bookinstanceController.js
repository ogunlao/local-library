const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');
const validator = require("express-validator")

// Display list of all BookInstances.
exports.bookinstance_list = function (req, res) {
  BookInstance.find()
    .populate('book')
    .exec(function (err, list_bookinstances) {
      if (err) { return next(err); }
      // Successful, so render
      res.render('bookinstance_list', { title: 'Book Instance List', bookinstance_list: list_bookinstances });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function (req, res, next) {

  BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function (err, bookinstance) {
      if (err) { return next(err); }
      if (bookinstance == null) { // No results.
        var err = new Error('Book copy not found');
        err.status = 404;
        return next(err);
      }
      // Successful, so render.
      res.render('bookinstance_detail', { title: 'Copy: ' + bookinstance.book.title, bookinstance: bookinstance });
    })

};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function (req, res, next) {

  Book.find({}, 'title')
    .exec(function (err, books) {
      if (err) { return next(err); }

      // Sort books by their title
      sort_func = (a, b) => { let textA = a.title.toUpperCase(); let textB = b.title.toUpperCase(); return (textA < textB) ? -1 : (textA > textB) ? 1 : 0; };
      books.sort(sort_func);

      // Successful, so render.
      res.render('forms/bookinstance_form', { title: 'Create BookInstance', book_list: books });
    });

};

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [

  // Validate fields.
  validator.body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  validator.body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  validator.body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  validator.sanitizeBody('book').escape(),
  validator.sanitizeBody('imprint').escape(),
  validator.sanitizeBody('status').trim().escape(),
  validator.sanitizeBody('due_back').toDate(),

  // Process request after validation and sanitization.
  (req, res, next) => {

    // Extract the validation errors from a request.
    const errors = validator.validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    console.log(req.body.book)
    var bookinstance = new BookInstance(
      {
        book: req.body.book,
        imprint: req.body.imprint,
        status: req.body.status,
        due_back: req.body.due_back
      });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages.
      Book.find({}, 'title')
        .exec(function (err, books) {
          if (err) { return next(err); }
          
          // Sort books by their title
          sort_func = (a, b) => { let textA = a.title.toUpperCase(); let textB = b.title.toUpperCase(); return (textA < textB) ? -1 : (textA > textB) ? 1 : 0; };
          books.sort(sort_func);
          
          console.log(bookinstance.book)
          // Successful, so render.
          res.render('forms/bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book, errors: errors.array(), bookinstance: bookinstance });
        });
      return;
    }
    else {
      // Data from form is valid.
      bookinstance.save(function (err) {
        if (err) { return next(err); }
        // Successful - redirect to new record.
        res.redirect(bookinstance.url);
      });
    }
  }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function (req, res) {
    res.render('forms/bookinstance_delete', { title: 'Delete Book Copy', bookinstance_id: req.params._id });
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function (req, res) {
  BookInstance.findByIdAndRemove(req.body.bookinstance_id, function deleteBookInstance(err) {
    if (err) { return next(err); }
    // Success - go to author list
    res.redirect('/catalog/bookinstances')
  })
}

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = function (req, res) {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};