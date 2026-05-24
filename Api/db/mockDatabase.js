// In-memory database - replaces MongoDB completely
const bcrypt = require('bcryptjs');

// Mock data
const mockData = {
  users: [
    {
      _id: '1',
      email: 'test@meblabs.com',
      password: bcrypt.hashSync('testtest', 10), // Real hash but works with any password in mock mode
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ],
  transactions: []
};

// Mock database methods
const mockDB = {
  // User methods
  findUserByEmail: async (email) => {
    return mockData.users.find(u => u.email === email);
  },
  
  findUserById: async (id) => {
    return mockData.users.find(u => u._id === id);
  },
  
  // Transaction methods
  findTransactionsByUser: async (userId) => {
    return mockData.transactions.filter(t => t.userId === userId);
  },
  
  findTransactionById: async (id) => {
    return mockData.transactions.find(t => t._id === id);
  },
  
  createTransaction: async (transactionData) => {
    const newTransaction = {
      _id: String(Date.now()),
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    mockData.transactions.push(newTransaction);
    return newTransaction;
  },
  
  updateTransaction: async (id, updateData) => {
    const index = mockData.transactions.findIndex(t => t._id === id);
    if (index !== -1) {
      mockData.transactions[index] = {
        ...mockData.transactions[index],
        ...updateData,
        updatedAt: new Date()
      };
      return mockData.transactions[index];
    }
    return null;
  },
  
  deleteTransaction: async (id) => {
    const index = mockData.transactions.findIndex(t => t._id === id);
    if (index !== -1) {
      mockData.transactions.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Mock Models (compatible with existing code)
class MockUser {
  static async findOne(query) {
    if (query.email) return mockDB.findUserByEmail(query.email);
    if (query._id) return mockDB.findUserById(query._id);
    return null;
  }
  
  static async findById(id) {
    return mockDB.findUserById(id);
  }
}

class MockTransaction {
  static async find(query = {}) {
    if (query.userId) {
      return mockDB.findTransactionsByUser(query.userId);
    }
    return mockData.transactions;
  }
  
  static async findById(id) {
    return mockDB.findTransactionById(id);
  }
  
  static async create(data) {
    return mockDB.createTransaction(data);
  }
  
  static async findByIdAndUpdate(id, data) {
    return mockDB.updateTransaction(id, data);
  }
  
  static async findByIdAndDelete(id) {
    return mockDB.deleteTransaction(id);
  }
}

// Mock connection function
const connectDB = async () => {
  return true;
};

module.exports = {
  connectDB,
  User: MockUser,
  Transaction: MockTransaction,
  mockDB
};