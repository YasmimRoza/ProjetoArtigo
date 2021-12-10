const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const path = require('path')

const Posts = require('./db/posts.js')

mongoose.connect('mongodb+srv://root:QuPga5CSgTOMRymR@cluster0.h2bbh.mongodb.net/dankicode?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Conectado com sucesso!')
}).catch(function(err){
    console.log(err.message)
})

//Configurando para receber dados
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

//Configurando para mexer com front
//O node é chamado para rederizar o html para ejs
app.engine('html', require('ejs').renderFile);
//É chamado para a view engine para ser html
app.set('view engine', 'ejs');
//O express é chamado para buscar a pasta public
app.use('/public', express.static(path.join(__dirname, 'public')));
//Aqui é para usar  diretorio como um todo
app.set('views', path.join(__dirname, '/views'));

app.get('/', (req,res) => {
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err, posts) {
            posts = posts.map(function(val){
                return{
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria
                }
            })
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                // console.log(posts[0]);
                  postsTop = postsTop.map(function(val){
                       return {
                           titulo: val.titulo,
                           conteudo: val.conteudo,
                           descricaoCurta: val.conteudo.substr(0,100),
                           imagem: val.imagem,
                           slug: val.slug,
                           categoria: val.categoria,
                           views: val.views
                       }
                  })
            res.render('home',{posts:posts, postsTop:postsTop});
          })
        })

    } else {

        Posts.find({titulo: {$regex: req.query.busca, $options:"i"}}, function(err, posts){
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,100),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                }
           })
            res.render('busca' , {posts:posts,contagem: posts.length})
        })

    }

});

app.get('/:slug', (req, res) => {
    //res.send(req.params.slug)
    Posts.findOneAndUpdate({slug: req.params.slug}, 
        {$inc : {views: 1}}, {new: true},
        function(err, resposta){

            if(resposta != null){
                Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
                    // console.log(posts[0]);
                      postsTop = postsTop.map(function(val){
                           return {
                               titulo: val.titulo,
                               conteudo: val.conteudo,
                               descricaoCurta: val.conteudo.substr(0,100),
                               imagem: val.imagem,
                               slug: val.slug,
                               categoria: val.categoria,
                               views: val.views
                           }
                      })
                res.render('single',{noticia:resposta, postsTop:postsTop});
              })
            } else {
                res.redirect('/')
            }

        })
})

app.listen(5000, console.log('Server ON!!'))