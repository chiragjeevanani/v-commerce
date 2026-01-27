import ContentModel from "../Models/ContentModel.js";

export const contentUpdate = async (req, res) => {
    try {
        const { content, contentType } = req.body;
        const contentData = await ContentModel.findOne({ contentType });
        if (contentData) {
            contentData.content = content;
            await contentData.save();
            return res.status(200).json({ message: "Content updated successfully" });
        } else {
            const newContent = new ContentModel({ content, contentType });
            await newContent.save();
            return res.status(200).json({ message: "Content created successfully" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteContent = async (req, res) => {
    try {
        const { contentType } = req.body;
        const contentData = await ContentModel.findOne({ contentType });
        if (contentData) {
            await contentData.remove();
            return res.status(200).json({ message: "Content deleted successfully" });
        } else {
            return res.status(404).json({ message: "Content not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getContent = async (req, res) => {
    try {
        const contentType = req.query.contentType;
        const contentData = await ContentModel.findOne({ contentType });
        return res.status(200).json(contentData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
