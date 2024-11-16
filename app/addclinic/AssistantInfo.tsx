import { StyleSheet, Text, View, Button, TextInput } from 'react-native'
import React from 'react'

const AssistantInfo = ({ prevStep, nextStep, assistantData, onAssistantDataChange }) => {
  const handleChange = (key, value) => {
    onAssistantDataChange({ ...assistantData, [key]: value })
  }

  return (
    <View style={styles.container}>
      <Text>Assistant Information</Text>
      <TextInput
        placeholder="Assistant Name"
        value={assistantData.assistantName || ''}
        onChangeText={(text) => handleChange('assistantName', text)}
      />
      <TextInput
        placeholder="Assistant Phone"
        value={assistantData.assistantPhone || ''}
        onChangeText={(text) => handleChange('assistantPhone', text)}
      />
      <Button title="Back" onPress={prevStep} />
      <Button title="Next" onPress={nextStep} />
    </View>
  )
}

export default AssistantInfo

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
