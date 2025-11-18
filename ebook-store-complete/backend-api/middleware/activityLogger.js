const ActivityLogger = require('../utils/activityLogger');

const logActivity = async (req, options) => {
  try {
    if (!req.user || !req.user.id) {
      console.warn('Activity logging skipped: No user in request');
      return;
    }

    const {
      actionType,
      entityType,
      entityId,
      entityName,
      description,
      oldData,
      newData
    } = options;

    const actionMap = {
      'CREATE': 'create',
      'UPDATE': 'update',
      'DELETE': 'delete',
      'create': 'create',
      'update': 'update',
      'delete': 'delete'
    };

    const action = actionMap[actionType] || actionType?.toLowerCase();

    if (!['create', 'update', 'delete'].includes(action)) {
      console.warn(`Invalid action type: ${actionType}`);
      return;
    }

    let changes = null;
    if (oldData && newData) {
      changes = {
        old: oldData,
        new: newData
      };
    } else if (newData) {
      changes = newData;
    } else if (oldData) {
      changes = { old: oldData };
    }

    await ActivityLogger.logActivity(
      req.user.id,
      entityType,
      action,
      entityId,
      entityName,
      description,
      changes,
      req
    );
  } catch (error) {
    console.error('Error in logActivity middleware:', error);
  }
};

module.exports = { logActivity };

