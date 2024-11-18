
declare module 'react-native-gesture-handler' {
  import * as React from 'react';
  import {
    ViewProps,
    ScrollViewProps,
    SwitchProps,
    TextInputProps,
    DrawerLayoutAndroidProps,
    FlatListProps,
    TouchableWithoutFeedbackProps,
  } from 'react-native';

  export class GestureHandlerRootView extends React.Component<ViewProps> {}
  export class ScrollView extends React.Component<ScrollViewProps> {}
  export class Switch extends React.Component<SwitchProps> {}
  export class TextInput extends React.Component<TextInputProps> {}
  export class DrawerLayoutAndroid extends React.Component<DrawerLayoutAndroidProps> {}
  export class FlatList<ItemT> extends React.Component<FlatListProps<ItemT>> {}
  export class TouchableWithoutFeedback extends React.Component<TouchableWithoutFeedbackProps> {}
}