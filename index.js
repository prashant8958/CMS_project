import express from 'express';
import bodyParser from 'body-parser';
import {dirname} from 'path';
import {fileURLToPath} from 'url';
import multer from 'multer';
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/uploads'));


let classes = [];
let students = [];
/////////// file uploading block logic using multer//////////////
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // folder to save files
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // unique filename
    }
  });
const upload = multer({ storage: storage });
function Check_password(req, res, next) {
    const password = req.body["password"];
    if (password === "PRASHANT_PAL") {
        req.Authorised_user = true; 
    } else {
        req.Authorised_user = false;
    }
    next(); 
}
app.get("/",function(req,res){
    res.sendFile(__dirname + "/home.html");
})
app.get("/student",function(req,res){
    res.redirect('/student-dashboard');
})
app.get("/teacher", function(req, res) {
    res.sendFile(__dirname + "/teacher.html");  
});
app.post("/authorised", Check_password, function(req, res) {
    if (req.Authorised_user) {
        res.sendFile(__dirname + "/faculti.html");
    } else {
        res.status(401).send(`
            <h1>Unauthorized</h1>
            <p>The password you entered is incorrect.</p>
            <a href="/teacher">Try Again</a>
        `);
    }
});


/////////////////////****teacher***** */////////////////////////
app.post('/create-class', (req, res) => {
    const className = req.body.className;
    const subjectName = req.body.subjectName;
    // console.log("Class Name:", className);
    // console.log("Subject Name:", subjectName);
    const newClass = {
        id: Date.now().toString(), // unique ID
        className,
        subjectName,
        document : [] ///// my work will be uploaded here ////////
    };
    classes.push(newClass);
    //console.log(classes);
    res.send(`
      <h1>Class Created Successfully!</h1>
      <p><strong>Class:</strong> ${className}</p>
      <p><strong>Subject:</strong> ${subjectName}</p>
      <a href="/view-class">View Class</a><br><br>
      <a href="/authorised">Go Back</a>
    `);
  });
  app.get('/view-class', (req, res) => {
    let classListHTML = classes.map(c => `
        <li>
            <h2>ClassName : ${c.className} <br> SubjectName : 
            ${c.subjectName} </h2>
            <form action="/edit-class" method="GET" style="display:inline;">
            <input type="hidden" name="id" value="${c.id}">
            <button type="submit">Edit</button>
            </form><br><br>
            <form action="/upload" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="id" value="${c.id}">
            <input type="file" name="myFile" required />
            <button type="submit">Upload</button>
            </form><br>
            ${c.document.length > 0 ? `
            <h4>Uploaded Files:</h4>
            <ul>
                ${c.document.map(file => `
                    <li><a href="/uploads/${file.filename}" target="_blank">${file.originalname}</a></li>
                `).join('')}
            </ul>
        ` : '<p>No files uploaded yet.</p>'}
            <form action="/delete-class" method="POST" style="display:inline;">
            <input type="hidden" name="id" value="${c.id}">
            <button type="submit">Delete</button>
            </form>
        </li>
    `).join("");   

    res.send(`
        <h1>All Classes</h1>
        <ul>${classListHTML}</ul>
        <a href="/">Home</a>
    `);
});
app.get('/edit-class', (req, res) => {
    const classToEdit = classes.find(c => c.id === req.query.id);
    if (!classToEdit) {
        return res.send("<p>Class not found.</p>");
    }
    res.send(`
        <h1>Edit Class</h1>  
        classToUpdate.className = className;
        classToUpdate.subjectName = subjectName;
    `)
    res.redirect('/view-class');
});
app.post('/delete-class', (req, res) => {
    const { id } = req.body;
    classes = classes.filter(c => c.id !== id);
    res.redirect('/view-class');
});
app.post('/upload', upload.single('myFile'), (req, res) => {
    if (!req.file) {
        return res.send('No file uploaded.');
    }
    const classId = req.body.id;
    const desiredClass = classes.find(c => c.id === classId);
    if (!desiredClass) {
        return res.send('Class not found.');
    }
    desiredClass.document.push({
        filename: req.file.filename,
        originalname: req.file.originalname
    });
    res.send(`
        <h1>File Uploaded Successfully!</h1>
        <p>File Name: ${req.file.originalname}</p>;
        <a href="/view-class">Back to Class View</a>
    `);
});
//////////////////////////////////// student /////////////////////////
app.get('/student-dashboard', (req, res) => {
    let dashboardHTML = classes.map(c => `
        <li>
            <h2>${c.className} - ${c.subjectName}</h2>
            ${c.document.length > 0 ? `
                <ul>
                    ${c.document.map(doc => `
                        <li><a href="/uploads/${doc.filename}" target="_blank">${doc.originalname}</a></li>
                    `).join('')}
                </ul>
            ` : '<p>No materials uploaded yet.</p>'}
        </li>
    `).join("");

    res.send(`
        <h1>Student Dashboard</h1>;
        <ul>${dashboardHTML}</ul>;
        <a href="/">Home</a>
    `);
});

app.listen(port, function(req,res){
    console.log(`Server is running on port ${port}`);
});