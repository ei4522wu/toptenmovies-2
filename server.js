const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const UPLOAD_DIR = path.join(__dirname, 'uploads');
const DATA_FILE = path.join(__dirname, 'movies.json');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf8');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + ext);
  }
});
const upload = multer({ storage });

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// health
app.get('/api/health', (req,res) => res.json({ok:true}));

// list movies
app.get('/api/movies', (req,res) => {
  const list = JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'[]');
  res.json(list);
});

// add movie (multipart with poster)
app.post('/api/movies', upload.single('poster'), (req,res) => {
  const body = req.body;
  const list = JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'[]');
  const id = (list.reduce((a,b)=>Math.max(a,b.id||0),0) || 0) + 1;
  const posterPath = req.file ? ('/uploads/' + req.file.filename) : (body.poster || '');
  const movie = {
    id,
    title: body.title || 'Untitled',
    year: body.year ? Number(body.year) : null,
    rating: body.rating ? Number(body.rating) : null,
    desc: body.desc || '',
    poster: posterPath,
    rank: body.rank ? Number(body.rank) : (list.length+1)
  };
  list.push(movie);
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  res.status(201).json(movie);
});

// delete movie
app.delete('/api/movies/:id', (req,res) => {
  const id = Number(req.params.id);
  let list = JSON.parse(fs.readFileSync(DATA_FILE,'utf8')||'[]');
  const idx = list.findIndex(m => m.id === id);
  if (idx === -1) return res.status(404).json({error:'Not found'});
  // optionally remove file
  try {
    if (list[idx].poster && list[idx].poster.startsWith('/uploads/')) {
      const fp = path.join(__dirname, list[idx].poster);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
  } catch(e){}
  list.splice(idx,1);
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
  res.json({ok:true});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Server started on', PORT));