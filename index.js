const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const alert = require('alert');
mongoose.connect('mongodb://127.0.0.1:27017/users', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.static('public'));
const formSchema = new mongoose.Schema({
    fname: String,
    lname: String,
    image: String,
    email: String,
    phone: Number,
    pass: String,
    address: String
});


const Form = mongoose.model('Form', formSchema);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/submit', async (req, res, next) => {
    const form1 = await Form.find();
    res.render('index', { form1 });
});

app.post('/submit', upload.single('image'), async (req, res, next) => {
    const { fname, lname, pass, email, phone, address } = req.body;
    // const imagePath = req.file.path.replace('public/uploads');
    const { filename } = req.file;

    const form = new Form({
        fname,
        lname,
        email,
        phone,
        pass,
        address,
        image: filename
    });

    await form.save();

    res.redirect('/submit')
});
app.post('/login', async (req, res) => {
    try {
        const id = req.params.id;
        const { email, pass } = req.body;
        const form = await Form.findOne({ email, pass });
        console.log(form)

        if (form) {
            // res.render('login',{form})
            res.render('profile', { form });




        } else {
            alert("wrong password")
            // res.send("Wrong Password")
        }
    } catch (error) {
        console.log(error);
        res.redirect('/error.html');
    }

});
app.post('/update', async (req, res) => {
    try {
        // const id = req.params.id;
        const { email, phone, pass } = req.body;
        const form = await Form.findOne({ pass });
        console.log(form)
        if (form) {
            const form1 = await form.updateOne({ email, phone });
            console.log(form1)
            res.render('profile', { form });
        } else {
            console.log("wrong")
            res.redirect('/error.html')
        }
    } catch (error) {
        console.log(error);
        res.redirect('/error.html');
    }

});
app.post('/delete', async (req, res) => {
    try {
        // const id = req.params.id;
        const { email,  pass } = req.body;
        const form = await Form.findOne({ email, pass });
        if (form) {
            const form1 = await form.deleteOne({});
            console.log(form1)
            alert("Deleted")
            res.redirect('/submit')
        } else {

            alert("wrong password")
        }

    } catch (error) {
        console.log(error);
        res.redirect('/error.html');
    }

});
//blogs
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: String,
    date: Date
});
app.use(express.static('public'));

const Blog = mongoose.model('Blog', blogSchema);
app.get('/blogs', async (req, res) => {
    const blogs = await Blog.find().sort('-date');

    res.render('blog', { blogs });
});

app.post('/blogs', upload.single('image'), async (req, res) => {
    const { title, content } = req.body;
    const { filename } = req.file;

    const blog = new Blog({
        title,
        content,
        image: filename,
        date: new Date()
    });

    await blog.save();
    res.redirect('/blogs')
});
app.get('/edit', async (req, res) => {
    const blog = await Blog.find();
    console.log(blog)

    res.render('edit', { blog });
});







// start the server
app.listen(5500, () => console.log('Server started on port 5500'));
