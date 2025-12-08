'use strict';

const { Op } = require('sequelize');
const db = require('../models');
const ActivityLogger = require('../utils/activityLogger');

const normalizeAuthor = (author) => {
  if (!author) return null;
  const a = author.toJSON ? author.toJSON() : author;
  return {
    id: a.id,
    name: a.name,
    bio: a.bio || a.biography || null,
    avatar: a.avatar || null,
    birthDate: a.birth_date || a.birthDate || null,
    nationality: a.nationality || null,
    website: a.website || null,
    socialLinks: a.social_links || a.socialLinks || null,
    booksCount: a.books_count || a.booksCount || 0,
    avgRating: parseFloat(a.avg_rating || a.avgRating || 0),
    isActive: typeof a.is_active === 'boolean' ? a.is_active : (a.isActive ?? true),
    createdAt: a.created_at || a.createdAt,
    updatedAt: a.updated_at || a.updatedAt,
  };
};

class AuthorController {
  async list(req, res) {
    try {
      const { search = '', page = 1, limit = 50 } = req.query;
      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { nationality: { [Op.like]: `%${search}%` } },
        ];
      }

      const { rows, count } = await db.Author.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        offset: (Number(page) - 1) * Number(limit),
        limit: Number(limit),
      });

      return res.json({ success: true, message: 'Authors fetched', data: rows.map(normalizeAuthor), pagination: { total: count, page: Number(page), limit: Number(limit), totalPages: Math.ceil(count / Number(limit)) } });
    } catch (error) {
      console.error('Authors list error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch authors' });
    }
  }

  async getById(req, res) {
    try {
      const { id } = req.params;
      const author = await db.Author.findByPk(id);
      if (!author) return res.status(404).json({ success: false, message: 'Author not found' });
      return res.json({ success: true, message: 'Author fetched', data: normalizeAuthor(author) });
    } catch (error) {
      console.error('Author getById error:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch author' });
    }
  }

  async create(req, res) {
    try {
      const {
        name,
        bio,
        avatar,
        birthDate,
        nationality,
        socialLinks,
        isActive = true,
      } = req.body;

      if (!name || String(name).trim() === '') {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }

      const created = await db.Author.create({
        name,
        bio,
        avatar,
        birth_date: birthDate || null,
        nationality: nationality || null,
        social_links: socialLinks || null,
        is_active: Boolean(isActive),
      });

      if (req.user && req.user.id) {
        await ActivityLogger.logAuthorActivity(req.user.id, 'create', created.id, created.name, null, req);
      }

      return res.status(201).json({ success: true, message: 'Author created', data: normalizeAuthor(created) });
    } catch (error) {
      console.error('Author create error:', error);
      return res.status(500).json({ success: false, message: 'Failed to create author' });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const author = await db.Author.findByPk(id);
      if (!author) return res.status(404).json({ success: false, message: 'Author not found' });

      const {
        name,
        bio,
        avatar,
        birthDate,
        nationality,
        socialLinks,
        isActive,
      } = req.body;

      const oldName = author.name;
      await author.update({
        name: name ?? author.name,
        bio: bio ?? author.bio,
        avatar: avatar ?? author.avatar,
        birth_date: birthDate !== undefined ? birthDate : author.birth_date,
        nationality: nationality !== undefined ? nationality : author.nationality,
        social_links: socialLinks !== undefined ? socialLinks : author.social_links,
        is_active: typeof isActive === 'boolean' ? isActive : author.is_active,
      });

      if (req.user && req.user.id) {
        await ActivityLogger.logAuthorActivity(req.user.id, 'update', author.id, author.name || oldName, null, req);
      }

      return res.json({ success: true, message: 'Author updated', data: normalizeAuthor(author) });
    } catch (error) {
      console.error('Author update error:', error);
      return res.status(500).json({ success: false, message: 'Failed to update author' });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      const author = await db.Author.findByPk(id);
      if (!author) return res.status(404).json({ success: false, message: 'Author not found' });

      const authorName = author.name;
      await author.destroy();

      if (req.user && req.user.id) {
        await ActivityLogger.logAuthorActivity(req.user.id, 'delete', parseInt(id), authorName, null, req);
      }

      return res.json({ success: true, message: 'Author deleted' });
    } catch (error) {
      console.error('Author delete error:', error);
      return res.status(500).json({ success: false, message: 'Failed to delete author' });
    }
  }
}

module.exports = new AuthorController();




