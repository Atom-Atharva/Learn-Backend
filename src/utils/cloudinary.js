import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            folder: "Learn-Backend",
            resource_type: "auto",
        });

        //file has been uploaded successfully
        // console.log(response);
        // console.log("File Uploded on Cloudinary", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // Remove Locally saved temp file as operation got failed
        fs.unlinkSync(localFilePath);
        console.log("File Failed To Upload:", error);

        return null;
    }
};

const deleteOnCloudinary = async (oldFileURL) => {
    try {
        // Check If Exist
        if (!oldFileURL) {
            return;
        }

        // Extract Public ID from URL
        // http://res.cloudinary.com/dk3rw649k/image/upload/v1716414490/Learn-Backend/xulhnnpqwxho8to8blgp.jpg
        const urlParts = oldFileURL.split("/");
        const fileName =
            urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
        const publicIdWithFormat = fileName.split(".")[0]; // Learn-Backend/xulhnnpqwxho8to8blgp

        // Remove From Cloudinary
        await cloudinary.uploader.destroy(
            publicIdWithFormat,
            function (error, result) {
                console.log(result);
            },
        );

        return;
    } catch (error) {
        console.log("File Failed To Upload: ", error);
        return;
    }
};

// cloudinary.uploader.upload(
//     "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//     { public_id: "olympic_flag" },
//     function (error, result) {
//         console.log(result);
//     },
// );

export { uploadOnCloudinary, deleteOnCloudinary };
