import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const transactions = [
  { id: '1', type: 'Consultation', amount: 150, date: '2024-09-01', status: 'Completed' },
  { id: '2', type: 'Consultation', amount: 200, date: '2024-09-10', status: 'Pending' },
  { id: '3', type: 'Surgery', amount: 1000, date: '2024-09-15', status: 'Completed' },
  // Add more transaction data here
];

const TransactionsScreen = () => {
  return (
    <View style={styles.container}>
      {/* Balance Summary Section */}
      <View style={styles.balanceSummary}>
        <Text style={styles.sectionTitle}>Balance Summary</Text>
        <View style={styles.balanceInfo}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Total Earnings</Text>
            <Text style={styles.balanceAmount}>$5000</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>$3000</Text>
          </View>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Withdrawable</Text>
            <Text style={styles.balanceAmount}>$2000</Text>
          </View>
        </View>
      </View>

      {/* Withdraw Button */}
      <TouchableOpacity style={styles.withdrawButton}>
        <Text style={styles.withdrawButtonText}>Withdraw</Text>
      </TouchableOpacity>

      {/* Transaction History Section */}
      <View style={styles.transactionHistory}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionItem}>
              <Text style={styles.transactionType}>{item.type}</Text>
              <Text style={styles.transactionAmount}>${item.amount}</Text>
              <Text style={styles.transactionDate}>{item.date}</Text>
              <Text style={styles.transactionStatus}>{item.status}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  balanceSummary: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  withdrawButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionHistory: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    elevation: 4,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  transactionType: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    flex: 1,
    textAlign: 'right',
  },
  transactionStatus: {
    fontSize: 12,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
});
