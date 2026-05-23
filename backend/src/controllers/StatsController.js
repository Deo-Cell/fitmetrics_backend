const StatsService = require('../services/StatsService');

class StatsController {
  constructor() {
    this.statsService = new StatsService();
  }

  getPersonalRecords = async (req, res) => {
    try {
      const records = await this.statsService.getPersonalRecords(req.user.id);
      res.json(records);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVolume = async (req, res) => {
    try {
      const { from, to } = req.query;
      const volume = await this.statsService.getVolume(req.user.id, { from, to });
      res.json(volume);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVolumeHistory = async (req, res) => {
    try {
      const { months } = req.query;
      const data = await this.statsService.getVolumeHistory(req.user.id, { months: months ? parseInt(months) : 3 });
      res.json(data);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getVolumeDaily = async (req, res) => {
    try {
      const { from, to, period } = req.query;
      const data = await this.statsService.getVolumeDaily(req.user.id, { from, to, period });
      res.json(data);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getDashboard = async (req, res) => {
    try {
      const dashboard = await this.statsService.getDashboard(req.user.id);
      res.json(dashboard);
    } catch (_error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = new StatsController();
