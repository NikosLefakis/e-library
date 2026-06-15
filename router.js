const express = require('express');
const User = require('./models/user.js');
// const library = require('./models/library.js');
const Book = require('./models/book.js');
const BookReview = require('./models/bookreview.js');
const router = express.Router();
const passport = require('./helpers/passport');
const bcrypt = require('bcrypt');
const Op = require('sequelize').Op;
const checkAuth = require('./middleware/auth');

router.post('/login',(req,res) => {
    const { username, password } = req.body;
    User.findOne({
        where: {
            username: username,
            password: password
        }
    }).then((user) => {
        if(user === null)
        {
            return res.json({"success":false})
        }
        else
        {
            res.cookie('user_id',user.id);
            res.cookie('user_role',user.role);
            // req.user = user;
            res.json({
                "user_id": user.id,
                "user_role": user.role,
                "success": true
            });    
        }
        
    }).catch((err) => {
        res.json(err);
    });
});

router.post('/login/guest',(req,res) => {
    res.cookie('user_role',"guest");
})

router.post('/register', (req, res) => {
  const { username, password } = req.body;
  // if(await User.findOne({where: {
  //   username: username
  // }}) === null )
  // {
  //   res.json({
  //       "success": false
  //   });
  // }
  // const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = new User({
    username: username,
    password: password
  });

  newUser.save().then((user) => {
    res.json({
        "success": true
    });
  });
});

router.get('/logout',(req,res) => {
    // req.cookies = null;
    // req.user = null;
});

router.get('/user/list',(req, res) => {
    // if(userRole == "administrator")
    User.findAll().then((users) => {
        res.json(users);
    });
});

router.delete('/user/delete',(req,res) => {
    const { user_id } = req.body;
    User.destroy({where: {id:user_id}});
});

//fetch user info
router.get('/profile/info', (req, res) => {
    const {user_id} = req.query;
    User.findOne({
        where:{
            id: user_id
        }
    }).then((user) => {
        res.json(user);
    })
});

//change profile settings
router.put('/profile/settings/:user_id', (req, res) => {
    const {settings} = req.body;
});


router.get('/library/books',(req,res) => {
    // const userType = req.cookies.user_role;
    // if(userType == "student")
    // {
    //     var { fromYear, toYear, title, author, fromPageNumber, toPageNumber } = req.query;
    //     // fromYear = parseInt(fromYear);
    //     // toYear = parseInt(toYear);
    //     Book.findAll({
    //         title: title,
    //         author: author,
    //         where: {
    //             publicationyear: {
    //                 [Op.between]: [fromYear,toYear]
    //             },
    //             pages: {
    //                 [Op.between]: [fromPageNumber,toPageNumber]
    //             }
    //         }
    //     }).then((books) => {
    //         res.json(books)
    //     });
    // }
    // else
    // {
        Book.findAll().then(books => {
            res.json(books);
        });
    // }
    
});

router.post('/library/books/create', (req, res) => {
    const {title, description,isbn,authors,genre,pages,publicationyear,url,photo} = req.body;
    Book.create(
        {
            title: title,
            description: description,
            isbn: isbn,
            authors: authors,
            genre: genre,
            pages: pages,
            publicationyear: publicationyear,
            url: url,
            photo: photo

        }
    ).then(book => {
        res.json(book);
    });
});

router.post('/library/books/review/create',(req,res) => {
    const { book_id, content} = req.body;
    if(req.cookies.user_role == "guest")
    {
        res.json({
            message:"Guests cannot review books!",
            success: false
        })
    }
    const user_id = req.cookies.user_id;
    BookReview.create({
        user_id: user_id,
        book_id: book_id,
        content: content
    }).then((bookreview) => {
        res.json(bookreview);
    });
});

router.get('/library/books/review/book/:book_id',(req,res) => {
    const book_id = req.params.book_id;
    BookReview.findAll({
        book_id: book_id
    }).then((books) => {
        res.json(books);
    });
});

router.get('/library/books/borrowed',(req,res) => {
    Book.findAll({
        borrowed: true
    }).then((books) => {
        res.json(books);
    })
});

router.post('/library/books/borrow/:book_id',(req,res) => {
    const {book_id} = req.params;
    Book.findOne({
        book_id:book_id
    }).then((book) => {
        BookBorrowing.create({
            book_id: book_id,
            user_id: req.cookies.user_id,
            status: "requested"
        }).then((bookborrowing) => {
            res.json(bookborrowing);
        });
    });
});

router.post('/library/books/setavailable/:book_id',(req,res) => {
    const {book_id} = req.params;
    Book.findOne({
        book_id:book_id
    }).then((book) => {
        book.available = true;
        book.save();
    });
});
// router.get('/books/borrowed/pdf/')

module.exports = router;