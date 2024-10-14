import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Tab } from 'react-native-elements'
import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

const tabs = () => {
  return (
    <Tab>
      <Tabs.Screen name="(tabs)" options={{tabBarIcon: ()=><Ionicons name="home" size={24} color="black" />}} />
      <Tabs.Screen name="search" options={{tabBarIcon: ()=><Ionicons name="search" size={24} color="black" />}} />
      <Tabs.Screen name="profile" options={{tabBarIcon: ()=><Ionicons name="person" size={24} color="black" />
      }} />

    </Tab>
  )
}

export default tabs

const styles = StyleSheet.create({})