import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';

interface PrescriptionFormProps {
  onSave: (prescriptionData: any) => void;
  onCancel: () => void;
  drugSuggestions: string[];
  fetchDrugSuggestions: (query: string) => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onSave, onCancel, drugSuggestions, fetchDrugSuggestions }) => {
  const [newEntry, setNewEntry] = useState({ medication: '', instructions: '', refills: '', warnings: '' });

  const handleSave = () => {
    onSave(newEntry);
    setNewEntry({ medication: '', instructions: '', refills: '', warnings: '' });
  };

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Add New Prescription</Text>
      <TextInput
        style={styles.modalInput}
        placeholder="Medication"
        value={newEntry.medication}
        onChangeText={text => {
          setNewEntry({ ...newEntry, medication: text });
          fetchDrugSuggestions(text);
        }}
      />
      {drugSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {drugSuggestions.map((suggestion, index) => (
            <TouchableOpacity key={index} onPress={() => setNewEntry({ ...newEntry, medication: suggestion })}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TextInput
        style={styles.modalInput}
        placeholder="Instructions"
        value={newEntry.instructions}
        onChangeText={text => setNewEntry({ ...newEntry, instructions: text })}
      />
      <TextInput
        style={styles.modalInput}
        placeholder="Refills"
        value={newEntry.refills}
        onChangeText={text => setNewEntry({ ...newEntry, refills: text })}
      />
      <TextInput
        style={styles.modalInput}
        placeholder="Warnings"
        value={newEntry.warnings}
        onChangeText={text => setNewEntry({ ...newEntry, warnings: text })}
      />
      <Button title="Save" onPress={handleSave} />
      <Button title="Cancel" onPress={onCancel} />
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f4f7',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 16,
  },
  suggestionText: {
    padding: 10,
    fontSize: 16,
  },
});

export default PrescriptionForm;
