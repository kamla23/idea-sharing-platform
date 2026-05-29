import Idea from "../models/idea.model.js";


export const createIdea = async (req, res) => {
  try {
    const { title, description, tags, category } = req.body;

 
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

  
    if (title.length > 100) {
      return res.status(400).json({ message: "Title cannot exceed 100 characters" });
    }


    const newIdea = new Idea({
      title,
      description,
      tags: tags || [], 
      category: category || "Other", 
      author: req.user.id, 
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getIdeas = async (req, res) => {
  try {

    const ideas = await Idea.find()
      .populate("author", "username email")
      .populate("comments.author", "username email")
      .sort({ createdAt: -1 }); 

    res.status(200).json(ideas);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const toggleLikeIdea = async (req, res) => {
  try {
    const ideaId = req.params.id; 
    const userId = req.user.id;   

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    
    const isLiked = idea.likes.includes(userId);

    if (isLiked) {
    
      idea.likes = idea.likes.filter((id) => id.toString() !== userId);
      await idea.save();
      return res.status(200).json({ message: "Idea unliked", totalLikes: idea.likes.length });
    } else {
      
      idea.likes.push(userId);
      await idea.save();
      return res.status(200).json({ message: "Idea liked", totalLikes: idea.likes.length });
    }

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const ideaId = req.params.id;
    const { text } = req.body;   

    if (!text) {
      return res.status(400).json({ message: "Comment text cannot be empty" });
    }

    const idea = await Idea.findById(ideaId);
    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    
    const newComment = {
      author: req.user.id, 
      text: text
    };

    idea.comments.push(newComment);
    await idea.save();

    res.status(201).json({ message: "Comment added successfully", comments: idea.comments });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const updateIdea = async (req, res, next) => {
  try {
    let idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    if (idea.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own ideas" });
    }

    idea = await Idea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "Idea updated successfully", idea });
  } catch (error) {
    next(error);
  }
};


export const deleteIdea = async (req, res, next) => {
  try {
    const idea = await Idea.findById(req.params.id);

    if (!idea) {
      return res.status(404).json({ message: "Idea not found" });
    }

    if (idea.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own ideas" });
    }

    await idea.deleteOne();

    res.status(200).json({ message: "Idea deleted successfully" });
  } catch (error) {
    next(error);
  }
};