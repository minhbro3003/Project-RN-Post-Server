const postModel = require("../models/postModel");

//create post
const createPostController = async (req, res) => {
    try {
        const { title, description } = req.body;
        //validate
        if (!title || !description) {
            return res.status(400).send({
                success: false,
                message: "Title and description are required",
            });
        }
        // Check authentication
        if (!req.auth || !req.auth._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User not logged in",
            });
        }
        const post = await postModel({
            title,
            description,
            postedBy: req.auth._id,
        }).save();
        res.status(201).send({
            success: true,
            message: "Post created successfully",
            post,
        });
        console.log(req.body);
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error api",
            error,
        });
    }
};

//get all posts
// const getAllPostsController = async (req, res) => {
//     try {
//         const posts = await postModel
//             .find().select("-_id -__v")
//             .populate("postedBy", "_id name email")
//             .sort({ createdAt: -1 });
//         console.log("Posts: ", posts)
//         res.status(200).send({
//             success: true,
//             message: "Posts fetched successfully",
//             posts,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             message: "Internal Server Error API",
//             error,
//         });
//     }
// };

// const getAllPostsController = async (req, res) => {
//     try {
//         const { search } = req.query; // Lấy từ khóa tìm kiếm từ query parameters
//         let query = {};

//         if (search) {
//             query = {
//                 $or: [
//                     { title: { $regex: search, $options: "i" } }, // Tìm kiếm theo tiêu đề
//                     { description: { $regex: search, $options: "i" } } // Tìm kiếm theo mô tả
//                 ]
//             };
//         }

//         const posts = await postModel
//             .find(query)
//             .select("-_id -__v")
//             .populate("postedBy", "_id name email")
//             .sort({ createdAt: -1 });

//         res.status(200).send({
//             success: true,
//             message: "Posts fetched successfully",
//             posts,
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             success: false,
//             message: "Internal Server Error API",
//             error,
//         });
//     }
// };

const getAllPostsController = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query; // Lấy search, trang và giới hạn từ query
        const skip = (page - 1) * limit; // Tính toán vị trí bắt đầu

        let filter = {};
        if (search) {
            filter = {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            };
        }

        const totalPosts = await postModel.countDocuments(filter); // Đếm tổng số bài viết
        const posts = await postModel
            .find(filter)
            .select("-_id -__v")
            .populate("postedBy", "_id name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).send({
            success: true,
            message: "Posts fetched successfully",
            totalPosts,
            totalPages: Math.ceil(totalPosts / limit), // Tổng số trang
            currentPage: Number(page),
            posts,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Internal Server Error API",
            error,
        });
    }
};

const updatePostController = async (req, res) => {
    try {
        const { title, description } = req.body;
        //user find
        const post = await postModel.findById({ _id: req.params.id });
        if (!title || !description) {
            return res.status(404).send({
                success: false,
                message: "title or description not found",
            });
        }

        //update user
        const updatePost = await postModel.findOneAndUpdate({ _id: req.params.id }, {
            title: title || post?.title,
            description: description || post?.description,
        }, { new: true });
        res.status(200).send({
            success: true,
            message: "Post updated successfully",
            updatePost,
        });
    } catch (error) {
        console.log("error: " + error);
        return res.status(500).send({
            success: false,
            message: "Internal Server Error Update",
            error,
        });
    }
};

const getUserPostsController = async (req, res) => {
    try {
        const userPosts = await postModel.find({ postedBy: req.auth._id })
        res.status(200).send({
            success: true,
            message: "User's posts fetched successfully",
            userPosts,
        })
        // console.log("userPosts: " + userPosts)
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Internal Server Error API",
            error,
        })
    }
}

const deletePostController = async (req, res) => {
    try {
        const { id } = req.params;
        await postModel.findByIdAndDelete({ _id: id })
        res.status(200).send({
            success: true,
            message: "Post deleted successfully",
        })

    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success: false,
            message: "Internal Server Error API",
            error,
        })
    }
}

module.exports = {
    createPostController,
    updatePostController,
    getAllPostsController,
    getUserPostsController,
    deletePostController
};
