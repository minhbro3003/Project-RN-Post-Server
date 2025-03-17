const express = require('express');
const { requireSignIn } = require('../controllers/userController');
const { createPostController, updatePostController, getAllPostsController, getUserPostsController, deletePostController } = require('../controllers/postController');

//router object
const router = express.Router();

//create post 
router.post('/create-post', requireSignIn, createPostController);
//get all posts
router.get('/get-all-posts', getAllPostsController);
//update post 
router.put('/update-post/:id', requireSignIn, updatePostController);

//get user post 
router.get('/get-user-post', requireSignIn, getUserPostsController)

//delete post 
router.delete('/delete-post/:id', requireSignIn, deletePostController);
//export 
module.exports = router;