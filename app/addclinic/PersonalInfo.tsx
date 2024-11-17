import { StyleSheet, Text, View, TextInput } from 'react-native'
import React from 'react'
import { Card, Button } from 'react-native-paper'
import PhoneInput from 'react-native-phone-input'
import { useRef } from 'react'

const PersonalInfo = ({ nextStep, personalData, onPersonalDataChange }) => {
  const phoneInput = useRef<PhoneInput>(null)

  const handleChange = (key, value) => {
    onPersonalDataChange({ ...personalData, [key]: value })
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Personal Information</Text>
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={personalData.name || ''}
          onChangeText={(text) => handleChange('name', text)}
        />
        <PhoneInput
          ref={phoneInput}
          style={styles.phoneInput}
          value={personalData.contactInfo || ''}
          initialCountry="ke"
          onChangePhoneNumber={(number) => handleChange('contactInfo', number)}
          autoFocus
        />
        <TextInput
          style={styles.input}
          placeholder="Address"
          value={personalData.address || ''}
          onChangeText={(text) => handleChange('address', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={personalData.email || ''}
          onChangeText={(text) => handleChange('email', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Bio"
          value={personalData.bio || ''}
          onChangeText={(text) => handleChange('bio', text)}
        />
        <Button mode="contained" onPress={nextStep} style={styles.button}>Next</Button>
      </Card>
    </View>
  )
}

export default PersonalInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
    marginTop: 16,
  },
})
