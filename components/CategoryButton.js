import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';

export default function CategoryButton({ icon, label, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', marginHorizontal: 10 }}>
            <View style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: '#000',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Image source={icon} style={{ width: 30, height: 30, tintColor: '#fff' }} />
            </View>
            <Text style={{ marginTop: 5, color: '#333', fontSize: 12 }}>{label}</Text>
        </TouchableOpacity>
    );
}