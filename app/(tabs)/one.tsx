import { StyleSheet, Text, View, Button } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router'

const One = () => {
  const router = useRouter();

  return (
    <View>
      <Text style={{fontSize:10}}>This is tab one</Text>
      <Button title="Go Back" onPress={() => router.back()} />
    </View>
  )
}

export default One

const styles = StyleSheet.create({})