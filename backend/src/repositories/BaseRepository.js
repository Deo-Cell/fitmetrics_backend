/**
 * Repository Pattern — Base Repository
 * Justification : Abstrait l'accès à la base de données derrière une interface
 * commune. Permet de remplacer facilement la source de données (ex: InMemory en test)
 * et d'isoler la logique métier de l'ORM.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findAll(options = {}) {
    return this.model.findAll(options);
  }

  async findById(id, options = {}) {
    return this.model.findByPk(id, options);
  }

  async findOne(where, options = {}) {
    return this.model.findOne({ where, ...options });
  }

  async create(data) {
    return this.model.create(data);
  }

  async update(id, data) {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    return record.update(data);
  }

  async delete(id) {
    const record = await this.model.findByPk(id);
    if (!record) return null;
    await record.destroy();
    return record;
  }

  async count(where = {}) {
    return this.model.count({ where });
  }
}

module.exports = BaseRepository;
