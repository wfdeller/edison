const videoService = require('./video.service');

const videoController = {
  async createVideo(req, res) {
    try {
      const video = await videoService.createVideo({
        ...req.body,
        createdBy: req.user.id // From auth middleware
      });
      res.status(201).json(video);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getVideo(req, res) {
    try {
      const video = await videoService.getVideoById(req.params.id);
      res.json(video);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  },

  async updateVideo(req, res) {
    try {
      const video = await videoService.updateVideo(req.params.id, req.body);
      res.json(video);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteVideo(req, res) {
    try {
      const result = await videoService.deleteVideo(req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getVideos(req, res) {
    try {
      const result = await videoService.getVideos(req.query);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async addTags(req, res) {
    try {
      const video = await videoService.addTags(req.params.id, req.body.tags);
      res.json(video);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async removeTags(req, res) {
    try {
      const video = await videoService.removeTags(req.params.id, req.body.tags);
      res.json(video);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getPopularTags(req, res) {
    try {
      const tags = await videoService.getPopularTags(req.query.limit);
      res.json(tags);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getVideoStats(req, res) {
    try {
      const stats = await videoService.getVideoStats();
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
};

module.exports = videoController; 