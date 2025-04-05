import React from 'react';
import { TextInput } from 'react-native';
import { globalStyles } from '../styles/globalStyles';

export default function Input({ placeholder, value, onChangeText, secureTextEntry }) {
    return (
        <TextInput
            style={globalStyles.input}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
        />
    );
}