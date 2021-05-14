const { Router } = require('express');
const router = Router();

const Product = require('../models/Product');
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const fs = require('fs');

process.on('unhandledRejection', function(err) {
    console.log(err);  
});

//INICIO
router.get('/prod/', async (req, res) => {
    await Product.find().lean().then(productos => res.render('prod', {productos: productos}));
});

//FORMULARIO
router.get('/prod/add', (req, res) =>{
    res.render('prod_form');
});

//POST_REGISTRO
router.post('/prod/add', async (req, res) => {
    const {title, description, category, price} = req.body;  
    let file = req.files;

    //Mapea los rutas del path
    var paths = req.files.map(file => file.path);
    const count = Object.keys(paths).length;
    console.log(req.body);
    let resultUrls = new String();
    let resultId = new String();
    let dtpathfile = new String();

    //Subir multiples imagenes
    await new Promise (async (resolve, reject) => {
        let upload_len = count ,upload_res = new Array(), upload_id = new Array();
        for(let i = 0; i <= upload_len + 1; i++){
            let filePath = paths[i]
            await cloudinary.v2.uploader.upload(filePath, (error, result) => {
                if (error){
                    console.log(error);
                    reject(error);
                } else {
                    upload_res.push(result.url)
                    upload_id.push(result.public_id)
                    resultUrls = upload_res
                    resultId = upload_id
                }
            }); 
        }
    }).catch((error) => {});

    //Modelo y Registro
    const newProd = new Product({
        title: title,
        description: description,
        category: category,
        price: price,
        imageURL: resultUrls,
        public_id: resultId
    })        
    await newProd.save()
    console.log(newProd)

    //Eliminar Fotolocal
    new Promise(async (resolve, reject) => {
        let delete_len = count;
        for(let i = 0; i <= delete_len; i++){
            let filePath = paths[i]
            if(!filePath || filePath[0] == 'undefined') return;
            console.log(filePath)
            await fs.unlink(filePath, (error, data) => {
                if(error) { 
                    console.log(error)
                    reject(error)
                } else {
                    dtpathfile = data
                }
            }); 
        }     
    }).catch((error) => {});    

    console.log('Registro exitoso')

    res.redirect('/prod/'); 

});

//INFO_PROD
router.get('/prod/update/:id', async (req, res) => {
    const { id } = req.params;
    const producto = await Product.findById(id);
    console.log(producto);
    res.render('prod_edit', {producto: producto});
});

//DELETE_PROD
router.get('/prod/delete/:id', async (req, res) => {
    const { id } = req.params;
    const prod_delete = await Product.findById(id);
    var paths = prod_delete.public_id;
    const count = Object.keys(paths).length;

    await new Promise (async (resolve, reject) => {
        let upload_len = count;
        for(let i = 0; i <= upload_len + 1; i++){
            let filePath = paths[i]
            await cloudinary.v2.uploader.destroy(filePath, (error) => {
                if (error){
                    console.log(error);
                    reject(error);
                }
            }); 
        }
    }).catch((error) => {});

    await Product.findByIdAndDelete(id);

    console.log('Producto elimninado', prod_delete);
    res.redirect('/prod/');
}); 


//UPDATE_PROD
router.post('/prod/update/:id', async (req, res) => {

    //ID
    const { id } = req.params;
    const prodimg_delete = await Product.findById(id);
    var imgprevpath = prodimg_delete.public_id;
    const countprevimg = Object.keys(imgprevpath).length;

    //DELETE_PREVIUS_IMAGES
    await new Promise (async (resolve, reject) => {
        let upload_len = countprevimg;
        for(let i = 0; i <= upload_len + 1; i++){
            let filePath = imgprevpath[i]
            await cloudinary.v2.uploader.destroy(filePath, (error) => {
                if (error){
                    console.log(error);
                    reject(error);
                }
            }); 
        }
    }).catch((error) => {});

    //BODY_FILE
    const { title, category, price, description } = req.body;   
    let file = req.files;
    var paths = req.files.map(file => file.path);
    const count = Object.keys(paths).length;
    console.log(req.body);
    let resultUrls = new String();
    let resultId = new String(); 

    //UPLOAD_IMAGES
    await new Promise (async (resolve, reject) => {
        let upload_len = count ,upload_res = new Array(), upload_id = new Array();
        for(let i = 0; i <= upload_len + 1; i++){
            let filePath = paths[i]
            await cloudinary.v2.uploader.upload(filePath, (error, result) => {
                if (error){
                    console.log(error);
                    reject(error);
                } else {
                    upload_res.push(result.url)
                    upload_id.push(result.public_id)
                    resultUrls = upload_res
                    resultId = upload_id
                }
            }); 
        }
    }).catch((error) => {});

    //COMPROBAR
    // const alterProd = new Product({
    //     title: title,
    //     description: description,
    //     category: category,
    //     price: price
    // });
    

    // //UPDATE_DB
    const prod_update = await Product.findByIdAndUpdate(id, {
        title: title,
        category: category,
        price: price,
        description: description,
        imageURL: resultUrls,
        public_id: resultId
    });

    //Eliminar Fotolocal
    new Promise(async (resolve, reject) => {
        let delete_len = count;
        for(let i = 0; i <= delete_len; i++){
            let filePath = paths[i]
            if(!filePath || filePath[0] == 'undefined') return;
            console.log(filePath)
            await fs.unlink(filePath, (error, data) => {
                if(error) { 
                    console.log(error)
                    reject(error)
                } else {
                    dtpathfile = data
                }
            }); 
        }     
    }).catch((error) => {}); 
    
    console.log(prod_update)

    console.log('Update Success')
    res.redirect('/prod/') 

});

module.exports = router;