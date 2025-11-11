module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define('WalletTransaction', {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
    },
    type: {
      type: DataTypes.ENUM('deposit', 'purchase', 'refund'),
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Positive for deposit/refund, negative for purchase',
    },
    balanceAfter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'balance_after',
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'book_id',
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  }, {
    tableName: 'wallet_transactions',
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
    ],
  });

  WalletTransaction.associate = (models) => {
    WalletTransaction.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    WalletTransaction.belongsTo(models.Book, { foreignKey: 'bookId', as: 'book' });
  };

  return WalletTransaction;
};


