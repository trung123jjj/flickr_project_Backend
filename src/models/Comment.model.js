import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        movieId: {
            type: Number, // ID từ TMDB
            required: true,
        },
        content: {
            type: String,
            maxlength: 500,
            // Logic: Bắt buộc có chữ NẾU không có ảnh. 
            // Nếu có ảnh rồi thì chữ có thể trống.
            required: function() {
                return !this.imageUrl; 
            }
        },
        imageUrl: {
            type: String, // Lưu đường dẫn ảnh (từ Cloudinary, S3, Firebase...)
            default: null
        }
    },
    {
        // Tự động tạo createdAt và updatedAt
        timestamps: true
    }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;